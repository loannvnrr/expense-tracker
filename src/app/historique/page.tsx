import { listExpenses } from "@/lib/queries";

export const dynamic = "force-dynamic";

function formatEUR(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

export default async function Historique({
  searchParams,
}: {
  searchParams: { merchant?: string };
}) {
  const rows = await listExpenses({ merchant: searchParams.merchant });

  return (
    <main style={{ fontFamily: "system-ui", padding: "1.25rem", maxWidth: 640, margin: "0 auto" }}>
      <header style={{ marginBottom: "1.25rem" }}>
        <a href="/" style={{ color: "#6366f1", fontSize: 14, textDecoration: "none" }}>
          ← Dashboard
        </a>
        <h1 style={{ margin: "0.5rem 0 0", fontSize: 22 }}>Historique</h1>
      </header>

      <form style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
        <input
          name="merchant"
          placeholder="Rechercher un commerçant..."
          defaultValue={searchParams.merchant}
          style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid #ddd" }}
        />
        <button
          type="submit"
          style={{ padding: "0.5rem 1rem", borderRadius: 8, border: "none", background: "#6366f1", color: "white" }}
        >
          Filtrer
        </button>
      </form>

      {rows.length === 0 && <p style={{ color: "#71717a", fontSize: 14 }}>Aucune dépense trouvée.</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {rows.map((e) => (
          <li key={e.id} style={{ padding: "0.75rem 0", borderBottom: "1px solid #eee" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong style={{ fontSize: 15 }}>{e.merchant ?? "Commerçant inconnu"}</strong>
              <strong style={{ fontSize: 15 }}>{formatEUR(Number(e.amount))}</strong>
            </div>
            <div style={{ fontSize: 12, color: "#71717a", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: e.categoryColor ?? "#94a3b8",
                }}
              />
              {new Date(e.occurredAt).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })} ·{" "}
              {e.categoryName ?? "Non catégorisé"}
              {e.source === "manuel" && " · saisie manuelle"}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
