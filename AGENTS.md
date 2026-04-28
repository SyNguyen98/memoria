# Memoria – Agent Guide

## Architecture Overview

Full-stack personal photo-memory app. Data hierarchy: **Collection → Location → Item** (mirrors folder structure on OneDrive).

```
backend/   Spring Boot 4 (Java 25) REST API on port 8080
frontend/  React 19 + Vite SPA on port 5173
```

Authentication: Google OAuth2 → backend issues a stateless **RSA-signed JWT** → stored in a browser cookie (`ACCESS_TOKEN`). Every API call attaches it via an Axios interceptor in `frontend/src/api/index.tsx`.

External services: **MongoDB Atlas** (persistence), **Microsoft Graph/OneDrive** (collection folder + media storage), **OpenStreetMap Nominatim** (reverse-geocoding for locations).

## Backend Conventions

- Package root: `org.chika.memoria`; sub-packages: `controllers`, `services`, `repositories`, `models`, `dtos`, `converters`, `security`, `client`, `configs`, `properties`, `utils`
- DTOs are **Records** (`CollectionRecord`, etc.) converted by **MapStruct** converters (`converters/`)
- Authenticated user is injected with `@CurrentUser UserPrincipal` on controller methods (see `security/CurrentUser.java`)
- All controllers use `@Slf4j` + `log.debug("VERB - description")` as the first statement in every method
- Pagination headers follow the `PaginationUtil.generatePaginationHttpHeaders(…)` pattern; frontend reads them off `AxiosHeaders`
- Swagger UI available in dev at `http://localhost:8080/swagger-ui.html`

### Running the backend
```bash
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
# Requires src/main/resources/application-local.yml with real credentials
```

Key env var for non-local profiles: `MONGODB_PASSWORD`

## Frontend Conventions

### Path Aliases (defined in `vite.config.ts`)
| Alias | Resolves to |
|---|---|
| `@components` | `src/components/` |
| `@constants` | `src/constants/` |
| `@hooks` | `src/hooks/` |
| `@models` | `src/models/` |
| `@pages` | `src/pages/` |
| `@queries` | `src/queries/` |
| `@providers` | `src/providers/` |
| `@utils` | `src/utils/` |

Always use these aliases for imports, never relative `../..` paths across feature boundaries.

### State & Data Fetching
- All server state is managed with **TanStack Query v5**. Query hooks live in `src/queries/use*Queries.ts`.
- Query keys follow the pattern `['camelCaseFunctionName', ...params]` (e.g. `['getCollectionById', id]`).
- Mutations use `useMutation` with a `mutationKey` alongside `mutationFn`.

### Route Structure
- Public routes (no JWT required): `/`, `memoria`, `about-me`, `faq`, `privacy-policy`
- Protected routes render `<SessionExpireDialog/>` when `ACCESS_TOKEN` cookie is missing (see `App.tsx`)
- Nested routing: `/collections/:collectionId/locations/:locationId/items`

### i18n
- Default language is Vietnamese (`'vn'`). English is `'en'`.
- Translation keys live in `src/translation/en.json` and `vi.json`. Always add keys to **both** files.
- Language is stored in `AppProvider` context and applied via `i18n.changeLanguage(currentLanguage)`.

### Running the frontend
```bash
cd frontend
npm install
# Create frontend/.env.local:
# VITE_BACKEND_URL=http://localhost:8080
# VITE_BASENAME=
npm run dev
```

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build (`--mode prod`) |
| `npm run build-dev` | Dev build |
| `npm run test` | Vitest watch mode (jsdom) |
| `npm run lint` | ESLint |

## Docker
```bash
# Backend only
docker build --target backend -t memoria-backend .
docker run -p 8080:8080 -e MONGODB_PASSWORD=<pw> memoria-backend

# Frontend only (nginx)
docker build --target frontend -t memoria-frontend .
docker run -p 80:80 memoria-frontend
```

## Deployment
- **Backend** → Azure Web App via `.github/workflows/deploy-azure-web-app.yml`
- **Frontend** → Azure Static Web Apps via `.github/workflows/azure-static-web-apps.yml`

