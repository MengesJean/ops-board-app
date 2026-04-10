# OpsBoard — Frontend

Interface Next.js d'OpsBoard. Côté applicatif (auth, dashboard, features métier), face à l'API Laravel du repo `../api`.

## Stack

- **Next.js 16** (App Router, Turbopack, React Server Components)
- **React 19**
- **TypeScript** strict
- **Tailwind CSS v4** (config via `@theme inline` dans `app/globals.css`, pas de `tailwind.config.*`)
- **shadcn/ui** — preset `base-nova` (sur `@base-ui/react`), thème neutre
- **next-themes** — dark / light / system avec persistance
- **react-hook-form** + **zod** — formulaires typés et validés
- **Vitest 4** + **React Testing Library** + **MSW** — tests unitaires

## Architecture

Authentification alignée sur **Laravel Sanctum SPA en mode stateful (cookies de session)** — pas de Bearer token, pas de `localStorage`. Les mutations passent par `/sanctum/csrf-cookie` puis envoient `X-XSRF-TOKEN`, le tout avec `credentials: 'include'`.

```
app/
├── (auth)/                 # Route group, layout centré, requireGuest()
│   ├── layout.tsx
│   ├── login/page.tsx
│   └── register/page.tsx
├── (protected)/            # Route group avec sidebar, requireAuth()
│   ├── layout.tsx
│   └── dashboard/page.tsx
├── layout.tsx              # ThemeProvider + AuthProvider hydraté server-side
└── page.tsx                # Redirect selon session

components/
├── ui/                     # Composants shadcn
├── auth/                   # LoginForm, RegisterForm
├── layout/                 # AppSidebar, AppHeader, UserMenu
└── theme/                  # ThemeProvider, ThemeToggle

lib/
├── api/
│   ├── client.ts           # fetch wrapper : CSRF auto, double URL client/server
│   ├── auth.ts             # register, login, me, logout
│   └── errors.ts           # ApiError, ValidationError, UnauthorizedError
└── auth/
    ├── session.ts          # getCurrentCustomer() server-side, cache() par requête
    └── guards.ts           # requireAuth, requireGuest

hooks/use-auth.tsx          # AuthProvider + useAuth, router.refresh() post-mutation
types/api.ts                # Customer, ApiResource<T>, ValidationErrorBody
test/                       # Setup Vitest, handlers MSW, utils de test
```

## Prérequis

- Docker Desktop
- Le proxy Traefik global tourne déjà sur le réseau `proxy` (voir [`~/docker/traefik`](https://github.com/MengesJean/docker-infra))
- Le cert mkcert couvre `*.ops-board.dev.localhost` (voir README de `~/docker/traefik`)
- L'API Laravel du repo `../api` tourne et est accessible sur `https://api.ops-board.dev.localhost`

## Variables d'environnement

Copier `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

| Variable | Rôle | Où |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL publique de l'API, utilisée depuis le navigateur | client |
| `NEXT_PUBLIC_APP_URL` | URL publique du front, injectée en `Origin` sur les appels SSR pour satisfaire le check stateful de Sanctum | server |
| `INTERNAL_API_URL` | URL interne de l'API sur le réseau Docker (`http://ops-board-nginx`), utilisée par les fetch SSR | server, Docker uniquement |

`INTERNAL_API_URL` est fournie par `docker-compose.yml` et ne doit pas être dans `.env.local` quand tu développes en local hors Docker.

## Démarrer le projet (Docker — méthode recommandée)

```bash
docker compose up -d
```

Le front est servi par Traefik sur :

👉 **https://app.ops-board.dev.localhost**

Le root page redirige automatiquement :
- vers `/login` si non authentifié
- vers `/dashboard` si une session Sanctum active est détectée

Commandes utiles :

```bash
docker compose logs -f front       # suivre les logs Next dev
docker compose restart front       # redémarrer (après un change de .env.local par ex.)
docker compose build front         # rebuild l'image (après un change de dépendance)
docker compose exec front sh       # shell dans le conteneur
docker compose down                # arrêter
```

> **Ajouter une dépendance** : soit `docker compose exec front npm install <pkg>` (rapide), soit ajouter dans `package.json` et `docker compose build front` (pour baker dans l'image).

## Démarrer le projet (hors Docker)

Utile pour du debug rapide sans les couches Traefik/Docker. Nécessite HTTPS côté front pour que les cookies cross-subdomain de Sanctum passent :

```bash
npm install
npm run dev -- --experimental-https
```

Dans ce mode, supprime ou laisse vide `INTERNAL_API_URL` — les fetch SSR utiliseront alors `NEXT_PUBLIC_API_URL` directement.

## Scripts

```bash
npm run dev          # next dev
npm run build        # build de production
npm run start        # serve le build de production
npm run lint         # eslint
npm test             # vitest run (une passe)
npm run test:watch   # vitest en mode watch
npm run test:ui      # vitest avec interface web
```

## Tests

Vitest + React Testing Library + MSW couvrent :

- **Formulaires d'auth** : rendu, validation zod (email, password, confirmation), succès, mapping des erreurs 422 du backend
- **`useAuth`** : hydratation initiale, login → user, logout → null
- **Guards** : `requireAuth` et `requireGuest` avec leur `redirect()`
- **ThemeToggle** : rendu et ouverture du menu

Les appels réseau sont mockés via MSW — aucune requête réelle n'est émise en test. Les Server Components async ne sont pas testés via Vitest (limitation connue) ; les guards qui les composent sont testés en isolation.

```bash
npm test
```

## Points d'architecture à connaître

**Stratégie d'auth Sanctum SPA.** Pas de token stocké côté client. Le cookie de session vit dans le cookie Laravel (`SameSite=None; Secure`), le front lit `XSRF-TOKEN` via `document.cookie` et le renvoie en header `X-XSRF-TOKEN` sur chaque mutation. Le `getCurrentCustomer()` server-side forward les cookies entrants via `next/headers` vers `/api/me`, et les layouts `(auth)` / `(protected)` décident le `redirect()` **avant** le rendu — zéro flash d'état auth.

**Double URL client/server.** Depuis le conteneur Docker, le domaine public `api.ops-board.dev.localhost` résout en loopback (TLD `.localhost` réservé) et n'atteint pas Traefik. Le code détecte `typeof window === "undefined"` et bascule sur `INTERNAL_API_URL` (`http://ops-board-nginx` via DNS Docker). L'en-tête `Origin` est alors injecté manuellement à `NEXT_PUBLIC_APP_URL` pour que Sanctum reconnaisse le stateful domain.

**Cache de session.** `getCurrentCustomer` est wrappée dans `React.cache()`, donc appelée plusieurs fois dans un même rendu server (root layout + guard) → une seule requête API effective.

**Thème sans flash.** `ThemeToggle` utilise `useSyncExternalStore` pour distinguer server / client, ce qui évite à la fois le flash de thème et le lint `react-hooks/set-state-in-effect` de Next 16.

## Configuration Laravel requise (côté `../api`)

Pour que Sanctum accepte le cookie de session cross-subdomain, dans `api/.env` :

```env
SESSION_DOMAIN=.ops-board.dev.localhost
SESSION_SAME_SITE=none
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=app.ops-board.dev.localhost
```

Et dans `api/config/cors.php`, `allowed_origins` doit contenir `https://app.ops-board.dev.localhost` avec `supports_credentials: true`.

## Prochaines étapes

Pour brancher une nouvelle feature métier :

1. **Nouvelle route protégée** : créer `app/(protected)/<feature>/page.tsx`. Le guard d'auth est hérité du layout parent.
2. **Nouvel appel API** : ajouter un module `lib/api/<feature>.ts` qui réutilise `apiFetch` — toute la gestion CSRF / session / erreurs est centralisée.
3. **Typage** : ajouter les types dans `types/api.ts`, utiliser `ApiResource<T>` pour les réponses `{ data: ... }`.
4. **Sidebar** : les entrées `Interventions / Clients / Reports / Settings` sont déjà déclarées dans `components/layout/app-sidebar.tsx` — il suffit de créer les pages correspondantes.
5. **Fetch SSR authentifié** : `apiFetch('/api/...', { cookie: (await cookies()).toString() })` depuis un Server Component.
