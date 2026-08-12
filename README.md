# Expense Tracker

## Ce qui est fait
- API `/api/expenses` (POST) pour le raccourci iPhone
- Dashboard (`/`) : totaux jour/semaine/mois/année, budget, répartition par
  catégorie, graphique d'évolution 14 jours, top dépenses
- Historique (`/historique`) : liste des dépenses avec recherche par commerçant
- `/api/dashboard`, `/api/categories`, `/api/expenses` (GET) pour usage externe

## Déploiement (Vercel + Neon, comme précédemment)

La base Neon a déjà les tables + 9 catégories de base créées.

1. Pousse ce dossier sur GitHub (remplace le contenu du repo existant :
   supprime les anciens fichiers puis fais glisser tout ce dossier avec
   "Add file > Upload files", GitHub conserve l'arborescence des sous-dossiers).
2. Vercel redéploie automatiquement à chaque push sur `main`.
3. Vérifie `DATABASE_URL` et `EXPENSES_API_KEY` sont toujours bien dans
   Environment Variables (elles ne changent pas, pas besoin d'y retoucher).

## À venir (étape 9)
- Gestion des budgets par catégorie (formulaire de création/édition)
- Modification/suppression d'une dépense depuis l'historique
- Alertes de dépassement de budget
