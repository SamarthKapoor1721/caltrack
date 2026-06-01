"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal, Button, Input, Field, Select, EmptyState, Metric } from "@/components/ui";
import { Search, Plus, Check, ChevronLeft, Target } from "@/components/icons";
import { MEAL_TYPES, MACRO_COLORS } from "@/lib/constants";

interface FoodItem {
  fdcId: number;
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  servingUnit: string;
}

type MealTypeValue = (typeof MEAL_TYPES)[number]["value"];

function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

/** Button that opens the design's food-search modal, wired to the real USDA + food-log APIs. */
export function AddFoodButton({
  meal,
  variant = "primary",
  iconOnly = false,
}: {
  meal?: MealTypeValue;
  variant?: "primary" | "soft";
  iconOnly?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {iconOnly ? (
        <button
          type="button"
          aria-label="Add food"
          onClick={() => setOpen(true)}
          className="ct-iconbtn inline-flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-border text-muted transition-all"
        >
          <Plus width={18} height={18} />
        </button>
      ) : (
        <Button variant={variant} onClick={() => setOpen(true)}>
          <Search width={17} height={17} /> Add food
        </Button>
      )}
      <FoodSearchModal open={open} meal={meal ?? "BREAKFAST"} onClose={() => setOpen(false)} />
    </>
  );
}

function FoodSearchModal({
  open,
  meal,
  onClose,
}: {
  open: boolean;
  meal: MealTypeValue;
  onClose: () => void;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q, 350);
  const [results, setResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [picked, setPicked] = useState<FoodItem | null>(null);
  const [qty, setQty] = useState(1);
  const [mealType, setMealType] = useState<MealTypeValue>(meal);
  const [saving, setSaving] = useState(false);

  useEffect(() => setMealType(meal), [meal, open]);
  useEffect(() => {
    if (!open) {
      setQ("");
      setResults([]);
      setPicked(null);
      setQty(1);
      setError("");
    }
  }, [open]);

  useEffect(() => {
    if (debouncedQ.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setSearching(true);
      setError("");
      try {
        const res = await fetch(`/api/food-search?q=${encodeURIComponent(debouncedQ)}`);
        const data = await res.json();
        if (cancelled) return;
        if (data.error) {
          setError(data.error);
          setResults([]);
        } else {
          setResults(data.foods ?? []);
        }
      } catch {
        if (!cancelled) setError("Network error. Please try again.");
      } finally {
        if (!cancelled) setSearching(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  const pick = useCallback(async (food: FoodItem) => {
    setError("");
    if (food.calories > 0) {
      setPicked(food);
      return;
    }
    // fall back to detail lookup for missing macros
    try {
      const res = await fetch("/api/food-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fdcId: food.fdcId }),
      });
      const data = await res.json();
      if (data.food) setPicked(data.food);
      else setError("Could not retrieve nutrition data.");
    } catch {
      setError("Network error. Please try again.");
    }
  }, []);

  const confirm = useCallback(async () => {
    if (!picked) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/food-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName: picked.name,
          calories: Math.round(picked.calories * qty),
          protein: Math.round(picked.protein * qty),
          carbs: Math.round(picked.carbs * qty),
          fat: Math.round(picked.fat * qty),
          mealType,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to log food.");
        return;
      }
      onClose();
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [picked, qty, mealType, onClose, router]);

  const tiles = useMemo(() => {
    if (!picked) return [];
    return [
      { label: "Calories", value: `${Math.round(picked.calories * qty)}`, color: "var(--fg)" },
      { label: "Protein", value: `${Math.round(picked.protein * qty)}g`, color: MACRO_COLORS.protein },
      { label: "Carbs", value: `${Math.round(picked.carbs * qty)}g`, color: MACRO_COLORS.carbs },
      { label: "Fat", value: `${Math.round(picked.fat * qty)}g`, color: MACRO_COLORS.fat },
    ];
  }, [picked, qty]);

  return (
    <Modal open={open} onClose={onClose} title={picked ? "Confirm entry" : "Search foods"} width={500}>
      {!picked ? (
        <div>
          <Input
            icon={<Search width={17} height={17} />}
            placeholder="Search USDA FoodData Central…"
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="mx-0.5 mb-3 mt-2.5 flex items-center gap-1.5 text-[11.5px] text-muted">
            <Target width={13} height={13} /> {searching ? "Searching…" : q.length >= 2 ? `${results.length} matches` : "Type at least 2 characters"}
          </div>
          {error && (
            <div className="mb-3 rounded-xl bg-red-500/8 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</div>
          )}
          <div className="-mx-1 grid max-h-[340px] gap-2 overflow-y-auto px-1">
            {results.map((r, i) => (
              <button
                key={`${r.fdcId}-${i}`}
                onClick={() => pick(r)}
                className="ct-searchrow flex items-center justify-between rounded-xl border border-border bg-[var(--bg)] px-3.5 py-3 text-left text-foreground transition-all"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold capitalize">{r.name}</div>
                  <div className="mt-0.5 font-mono text-[11.5px] text-muted">
                    {r.brand ? r.brand : `${r.servingSize} ${r.servingUnit}`}
                    {r.calories > 0 && ` · P${r.protein} C${r.carbs} F${r.fat}`}
                  </div>
                </div>
                <span className="flex items-center gap-2">
                  {r.calories > 0 && <span className="font-mono font-bold">{r.calories}</span>}
                  <Plus width={16} height={16} className="text-primary" />
                </span>
              </button>
            ))}
            {!searching && q.trim().length >= 2 && results.length === 0 && !error && (
              <EmptyState icon={<Search width={26} height={26} />} title="No matches" hint="Try a different food name." />
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="rounded-xl border border-border bg-[var(--bg)] px-4 py-4">
            <div className="text-base font-bold capitalize">{picked.name}</div>
            <div className="mt-0.5 text-[12.5px] text-muted">
              {picked.brand ? picked.brand : `${picked.servingSize} ${picked.servingUnit}`}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <Field label="Meal">
              <Select
                value={mealType}
                onChange={(v) => setMealType(v as MealTypeValue)}
                options={MEAL_TYPES.map((m) => ({ value: m.value, label: m.label }))}
              />
            </Field>
            <Field label="Servings">
              <Input
                type="number"
                step="0.5"
                min="0.5"
                value={qty}
                onChange={(e) => setQty(Math.max(0.5, parseFloat(e.target.value) || 0.5))}
              />
            </Field>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {tiles.map((t) => (
              <Metric key={t.label} label={t.label} value={t.value} color={t.color} />
            ))}
          </div>
          {error && <div className="rounded-xl bg-red-500/8 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">{error}</div>}
          <div className="flex justify-end gap-2.5">
            <Button variant="ghost" onClick={() => setPicked(null)}>
              <ChevronLeft width={16} height={16} /> Back
            </Button>
            <Button variant="primary" onClick={confirm} disabled={saving}>
              <Check width={16} height={16} /> {saving ? "Adding…" : `Add to ${MEAL_TYPES.find((m) => m.value === mealType)?.label.split(" ").slice(1).join(" ")}`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
