# Expense Tracker — API

Contient pour l'instant l'endpoint qui reçoit les dépenses du raccourci
iPhone, plus une page d'accueil et un endpoint de santé pour vérifier
que tout fonctionne. Dashboard et historique viendront aux étapes suivantes.

## Déploiement (Vercel + Neon)

La base Neon est déjà créée avec les tables (SQL exécuté à la main).
Il ne reste que le déploiement de l'app :

1. **GitHub** : pousse ce dossier dans un repo (idéalement privé, vu que
   c'est un projet avec de la logique financière perso).
2. **Vercel** : "Add New Project" → sélectionne le repo → avant de cliquer
   Deploy, ouvre "Environment Variables" et ajoute :
   - `DATABASE_URL` → la chaîne de connexion copiée depuis console.neon.tech
   - `EXPENSES_API_KEY` → une longue chaîne aléatoire que toi seul connais
3. Clique Deploy. Après 1-2 min, Vercel donne une URL du type
   `https://expense-tracker-xxxx.vercel.app`.

## Vérifier que ça fonctionne

Ouvre simplement dans un navigateur :

```
https://expense-tracker-xxxx.vercel.app/api/health
```

Tu dois voir `{"status":"ok","database":"connected"}`. Si tu vois une
erreur, c'est probablement `DATABASE_URL` mal copiée dans les variables
d'environnement Vercel — vérifie qu'il n'y a pas d'espace ou de retour
à la ligne collé par erreur.

## Brancher le raccourci iPhone

Dans l'action "Obtenir le contenu de" du raccourci, remplace l'URL par :

```
https://expense-tracker-xxxx.vercel.app/api/expenses
```

Et le header `Authorization` par `Bearer <ta vraie EXPENSES_API_KEY>`.

## Si tu modifies le schéma plus tard

Les tables ont été créées à la main via SQL cette fois-ci (pas de
terminal disponible). Si tu ajoutes une colonne dans `src/db/schema.ts`
plus tard depuis un poste avec accès terminal, tu peux repasser par
`npm run db:generate && npm run db:migrate` normalement — sinon,
adapte le SQL à la main comme cette fois-ci.
