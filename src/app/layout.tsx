export const metadata = {
  title: "Expense Tracker",
  description: "API de gestion de dépenses personnelle",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, background: "#ffffff", color: "#111111" }}>{children}</body>
    </html>
  );
}
