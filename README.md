# Chantiers

Statut des projets de programmation, en une page. Publié via GitHub Pages, données dans [`projects.json`](projects.json).

## Mise en route (deux réglages à faire une seule fois, toi-même)

Claude ne crée jamais de token à ta place — voici comment faire les deux dont ce dépôt a besoin.

### 1. Le token pour l'actualisation automatique (GitHub Action)

Permet à l'Action programmée (tous les jours à 6h UTC) de lire l'activité de tes dépôts privés.

1. https://github.com/settings/personal-access-tokens/new
2. Nom : `chantiers-read`, expiration à ta convenance (renouvelable)
3. Repository access → **Only select repositories** → coche tous les dépôts listés dans `projects.json`
4. Permissions → Repository permissions → **Contents: Read-only**, **Metadata: Read-only**
5. Générer, copier le token
6. Dans **ce** dépôt : Settings → Secrets and variables → Actions → New repository secret
   - Name: `PROJECTS_READ_TOKEN`
   - Value: le token copié

### 2. Le token pour éditer un statut depuis la page

Permet au bouton ⚙️ Réglages de la page d'écrire dans `projects.json` quand tu changes un statut.

1. https://github.com/settings/personal-access-tokens/new
2. Nom : `chantiers-write`, expiration à ta convenance
3. Repository access → **Only select repositories** → coche uniquement **chantiers**
4. Permissions → Repository permissions → **Contents: Read and write**
5. Générer, copier le token
6. Sur la page publiée elle-même : bouton ⚙️ Réglages (en haut à droite) → coller le token → Enregistrer

Ce token reste uniquement dans le `localStorage` de ton navigateur — jamais envoyé nulle part sauf à `api.github.com`. Le supprimer depuis les Réglages de la page, ou le révoquer depuis GitHub, l'invalide immédiatement.

## Activer GitHub Pages

Settings → Pages → Source: **Deploy from a branch** → Branch: `main` / `(root)`.

## Modifier un projet

- **Statut** (en cours / en pause / terminé / abandonné / brouillon) : directement sur la page, menu déroulant sur chaque carte.
- **Description, tags, nom** : édite `projects.json` à la main (ou via GitHub).
- **Ajouter un projet** : ajoute une entrée dans `projects.json` avec un `id` unique et le `repo` au format `owner/nom`. L'Action le prendra en compte au prochain passage.
