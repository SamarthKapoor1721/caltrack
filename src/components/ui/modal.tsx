"use client";

import { useEffect, type ReactNode } from "react";
import { Close } from "@/components/icons";
import { IconButton } from "./primitives";

export function Modal({
  open,
  onClose,
  children,
  title,
  width = 460,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  width?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      onClick={onClose}
      className="anim-fade"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(8,12,22,.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="anim-scale"
        style={{
          width: "100%",
          maxWidth: width,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-lg)",
          padding: 24,
          maxHeight: "88vh",
          overflowY: "auto",
          marginBottom: "min(8vh, 60px)",
        }}
      >
        {title && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h3 style={{ margin: 0, fontSize: 19, fontWeight: 700 }}>{title}</h3>
            <IconButton icon={<Close width={18} height={18} />} onClick={onClose} label="Close" />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
