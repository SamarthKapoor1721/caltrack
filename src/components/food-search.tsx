"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { MEAL_TYPES, MACRO_COLORS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "@/components/icons";

// ─── Types ────────────────────────────────────────
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

interface FoodSearchProps {
  /** Called after a food is successfully logged */
  onLogged?: () => void;
}

// ─── Icons (inline to keep component self-contained) ──
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Debounce hook ────────────────────────────────
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ─── Component ────────────────────────────────────
export function FoodSearch({ onLogged }: FoodSearchProps) {
  // Search state
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 350);
  const [suggestions, setSuggestions] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);

  // Selected food state
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [lookingUp, setLookingUp] = useState(false);

  // Log state
  const [mealType, setMealType] = useState<MealTypeValue>("BREAKFAST");
  const [logging, setLogging] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  const [error, setError] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  // ── Instant search (type-ahead) ──────────────────
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    (async () => {
      setSearching(true);
      setError("");
      try {
        const res = await fetch(`/api/food-search?q=${encodeURIComponent(debouncedQuery)}`);
        const data = await res.json();
        if (!cancelled) {
          if (data.error) {
            setError(data.error);
            setSuggestions([]);
          } else {
            setSuggestions(data.foods ?? []);
          }
        }
      } catch {
        if (!cancelled) {
          setError("Network error. Please try again.");
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    })();

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  // ── Select a suggestion → populate detail card ──
  // FDC search results already include macros, but if calories are 0
  // we fall back to a detail lookup by fdcId.
  const selectFood = useCallback(async (food: FoodItem) => {
    setSuggestions([]);
    setQuery(food.name);
    setError("");

    if (food.calories > 0) {
      setSelected(food);
      return;
    }

    // Fallback: detail lookup
    setLookingUp(true);
    try {
      const res = await fetch("/api/food-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fdcId: food.fdcId }),
      });
      const data = await res.json();
      if (data.food) {
        setSelected(data.food);
      } else {
        setError("Could not retrieve nutrition data.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLookingUp(false);
    }
  }, []);

  // ── Log the food item ─────────────────────────
  const logFood = useCallback(async () => {
    if (!selected) return;
    setLogging(true);
    setError("");

    try {
      const res = await fetch("/api/food-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foodName: selected.name,
          calories: selected.calories,
          protein: selected.protein,
          carbs: selected.carbs,
          fat: selected.fat,
          mealType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to log food.");
        return;
      }

      setLogSuccess(true);
      setTimeout(() => {
        setLogSuccess(false);
        setSelected(null);
        setQuery("");
        inputRef.current?.focus();
        onLogged?.();
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLogging(false);
    }
  }, [selected, mealType, onLogged]);

  return (
    <div className="space-y-4">
      {/* ── Search input ──────────────────────── */}
      <div className="relative">
        <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setLogSuccess(false);
            setError("");
          }}
          placeholder="Search for a food… e.g. chicken breast"
          className="h-12 w-full rounded-2xl border border-border-light bg-card pl-10 pr-4 text-sm shadow-sm transition-all placeholder:text-muted/60 hover:border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:shadow-md"
          autoComplete="off"
        />
        {searching && (
          <SpinnerIcon className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        )}
      </div>

      {/* ── Search error ────────────────────── */}
      {error && !selected && (
        <div className="rounded-xl bg-red-500/8 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ── Suggestions dropdown ──────────────── */}
      {suggestions.length > 0 && !selected && (
        <Card className="max-h-72 overflow-y-auto p-0">
          <ul className="divide-y divide-border-light">
            {suggestions.map((food, i) => (
              <li key={`${food.name}-${i}`}>
                <button
                  type="button"
                  onClick={() => selectFood(food)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-primary/5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/6 text-sm">
                    🍽️
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold capitalize">
                      {food.name}
                    </p>
                    <p className="text-xs text-muted">
                      {food.brand
                        ? food.brand
                        : `${food.servingSize} ${food.servingUnit}`}
                      {food.calories > 0 && ` · ${food.calories} kcal`}
                    </p>
                  </div>
                  <SearchIcon className="h-4 w-4 shrink-0 text-muted/40" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* ── Loading indicator ─────────────────── */}
      {lookingUp && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted">
          <SpinnerIcon className="h-5 w-5" />
          Looking up nutrition data…
        </div>
      )}

      {/* ── Selected food detail card ─────────── */}
      {selected && !logSuccess && (
        <Card className="animate-scale-in">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-2xl">
              🍽️
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-bold capitalize">
                {selected.name}
              </h3>
              <p className="text-xs text-muted">
                {selected.brand
                  ? selected.brand
                  : `${selected.servingSize} ${selected.servingUnit}`}
              </p>
            </div>
          </div>

          {/* Macro grid */}
          <div className="mt-5 grid grid-cols-4 gap-2 sm:gap-3">
            <MacroPill label="Calories" value={`${selected.calories}`} unit="kcal" color="var(--primary)" />
            <MacroPill label="Protein" value={`${selected.protein}`} unit="g" color={MACRO_COLORS.protein} />
            <MacroPill label="Carbs" value={`${selected.carbs}`} unit="g" color={MACRO_COLORS.carbs} />
            <MacroPill label="Fat" value={`${selected.fat}`} unit="g" color={MACRO_COLORS.fat} />
          </div>

          {/* Meal type selector */}
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold">Add to meal</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMealType(m.value)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${
                    mealType === m.value
                      ? "border-primary bg-primary text-white shadow-sm"
                      : "border-border-light bg-card text-foreground hover:border-border hover:bg-primary/5"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-4 rounded-xl bg-red-500/8 p-3 text-center text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Add button */}
          <Button
            size="lg"
            className="mt-5 w-full"
            disabled={logging}
            onClick={logFood}
          >
            {logging ? (
              <>
                <SpinnerIcon className="h-4 w-4" />
                Saving…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Log {MEAL_TYPES.find((m) => m.value === mealType)?.label.split(" ")[1] ?? "Food"}
              </>
            )}
          </Button>
        </Card>
      )}

      {/* ── Success state ─────────────────────── */}
      {logSuccess && (
        <Card className="flex flex-col items-center justify-center py-8 animate-scale-in">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckIcon className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-lg font-bold">Food logged!</p>
          <p className="mt-1 text-sm text-muted">
            Added to {MEAL_TYPES.find((m) => m.value === mealType)?.label.split(" ").slice(1).join(" ") ?? "your log"}.
          </p>
        </Card>
      )}

      {/* ── Empty state hint ──────────────────── */}
      {!query && !selected && !logSuccess && (
        <div className="flex flex-col items-center py-10 text-center">
          <SearchIcon className="mb-3 h-10 w-10 text-muted/30" />
          <p className="text-sm text-muted">
            Type a food name above to search the USDA FoodData Central database.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Sub-component ───────────────────────────────
function MacroPill({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-border-light bg-background p-2.5 sm:p-3">
      <span
        className="mb-1.5 h-1.5 w-6 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-lg font-bold tabular-nums">{value}</span>
      <span className="text-[10px] text-muted">
        {unit} {label.toLowerCase() !== "calories" && label.toLowerCase()}
      </span>
      <span className="text-[10px] font-semibold text-muted">{label}</span>
    </div>
  );
}
