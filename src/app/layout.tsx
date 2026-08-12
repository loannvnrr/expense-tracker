export const metadata = {
  title: "Expense Tracker",
  description: "API de gestion de dépenses personnelle",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
