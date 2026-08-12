import { getDashboardData } from "@/lib/queries";
import TrendChart from "@/components/TrendChart";

export const dynamic = "force-dynamic";

function formatEUR(n: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);
}

export default async function Home() {
  const data = await getDashboardData();

  return (
    <main style={{ fontFamily: "system-ui", padding: "1.25rem", maxWidth: 640, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Mes dépenses</h1>
        <a href="/historique" style={{ color: "#6366f1", fontSize: 14, textDecoration: "none" }}>
          Historique →
        </a>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "1.5rem" }}>
        <Card label="Aujourd'hui" value={formatEUR(data.today)} />
        <Card label="Cette semaine" value={formatEUR(data.week)} />
        <Card label="Ce mois-ci" value={formatEUR(data.month)} />
        <Card label="Cette année" value={formatEUR(data.year)} />
      </section>

      {data.globalBudget !== null ? (
        <section style={{ marginBottom: "1.5rem", padding: "1rem", borderRadius: 12, background: "#f4f4f5" }}>
          <p style={{ margin: 0, fontSize: 14 }}>
            Budget mensuel : {formatEUR(data.month)} / {formatEUR(data.globalBudget)}
          </p>
          <div style={{ height: 8, background: "#e4e4e7", borderRadius: 4, marginTop: 8, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, (data.month / data.globalBudget) * 100)}%`,
                background: data.month > data.globalBudget ? "#ef4444" : "#22c55e",
              }}
            />
          </div>
        </section>
      ) : (
        <section style={{ marginBottom: "1.5rem", padding: "0.75rem 1rem", borderRadius: 12, background: "#fafafa", fontSize: 13, color: "#71717a" }}>
          Pas encore de budget mensuel défini.
        </section>
      )}

      <h2 style={{ fontSize: 16, marginBottom: "0.5rem" }}>Par catégorie (ce mois)</h2>
      {data.byCategory.length === 0 && <p style={{ color: "#71717a", fontSize: 14 }}>Aucune dépense ce mois-ci.</p>}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {data.byCategory.map((c) => (
          <li
            key={c.categoryId ?? "none"}
            style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #eee", fontSize: 14 }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 5, background: c.color }} />
              {c.name}
            </span>
            <strong>{formatEUR(c.total)}</strong>
          </li>
        ))}
      </ul>

      <h2 style={{ fontSize: 16, margin: "1.5rem 0 0.5rem" }}>Évolution (14 derniers jours)</h2>
      <TrendChart data={data.trend} />

      <h2 style={{ fontSize: 16, margin: "1.5rem 0 0.5rem" }}>Principales dépenses (ce mois)</h2>
      {data.topExpenses.length === 0 && <p style={{ color: "#71717a", fontSize: 14 }}>Rien à afficher.</p>}
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {data.topExpenses.map((e) => (
          <li key={e.id} style={{ display: "flex", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid #eee", fontSize: 14 }}>
            <span>{e.merchant ?? "Commerçant inconnu"}</span>
            <strong>{formatEUR(Number(e.amount))}</strong>
          </li>
        ))}
      </ul>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "0.9rem", borderRadius: 12, background: "#fafafa", border: "1px solid #eee" }}>
      <p style={{ margin: 0, fontSize: 12, color: "#71717a" }}>{label}</p>
      <p style={{ margin: "4px 0 0", fontSize: 19, fontWeight: 700 }}>{value}</p>
    </div>
  );
}
