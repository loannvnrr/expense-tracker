"use client";

import { useState, useTransition } from "react";
import { updateExpenseCategory, deleteExpense } from "@/lib/actions";

export default function ExpenseRowControls({
  expenseId,
  categoryId,
  categories,
}: {
  expenseId: string;
  categoryId: string | null;
  categories: { id: string; name: string }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
      <select
        value={categoryId ?? ""}
        disabled={isPending}
        onChange={(e) => {
          const value = e.target.value || null;
          startTransition(() => {
            updateExpenseCategory(expenseId, value);
          });
        }}
        style={{ fontSize: 12, padding: "3px 6px", borderRadius: 6, border: "1px solid #ddd", color: "#333" }}
      >
        <option value="">Non catégorisé</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {confirmingDelete ? (
        <>
          <button
            onClick={() => startTransition(() => deleteExpense(expenseId))}
            style={{ fontSize: 12, color: "white", background: "#ef4444", border: "none", borderRadius: 6, padding: "3px 8px" }}
          >
            Confirmer
          </button>
          <button
            onClick={() => setConfirmingDelete(false)}
            style={{ fontSize: 12, color: "#666", background: "none", border: "none" }}
          >
            Annuler
          </button>
        </>
      ) : (
        <button
          onClick={() => setConfirmingDelete(true)}
          style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none" }}
        >
          Supprimer
        </button>
      )}
    </div>
  );
}
