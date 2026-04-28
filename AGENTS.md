# Memoria Frontend – Agent Instructions

## Project Overview

Memoria is a React 19 + Vite SPA for storing and browsing personal memories (photos, 360° media) organised into *
*Collections → Locations → Items**. It uses Google OAuth2 for auth and talks to a separate Spring Boot backend via a
single Axios instance.

## Key Commands

```bash
npm run dev          # Start dev server on http://localhost:5173
npm run build        # Production build (tsc -b && vite build --mode prod)
npm run build-dev    # Dev build (tsc && vite build --mode dev)
npm run preview      # Preview the production build locally
npm run lint         # ESLint
npm run test         # Vitest in watch mode
```

## Environment Variables

- `VITE_BACKEND_URL` – backend base URL (injected into `src/constants/Url.ts`)
- `VITE_BASENAME` – BrowserRouter basename (used in `src/index.tsx`)

## Path Aliases (configured in `vite.config.ts`)

| Alias        | Maps to          |
|--------------|------------------|
| `@constants` | `src/constants/` |
| `@models`    | `src/models/`    |
| `@queries`   | `src/queries/`   |
| `@providers` | `src/providers/` |
| `@utils`     | `src/utils/`     |

Always prefer aliases over relative imports when crossing directory boundaries.

## Architecture: Data Flow

```
Google OAuth2 → /oauth2/redirect → OAuthRedirectHandler
  → stores "Bearer <token>" in cookie (ACCESS_TOKEN)
  → appAxios interceptor attaches it on every request
  → useUserQuery('getCurrentUser') hydrates AppProvider
```

All API calls go through `src/api/index.tsx` (`appAxios`). The base URL is `VITE_BACKEND_URL`; endpoints are prefixed
`/api/...`.

## Data Hierarchy

`Collection` (shared via `userEmails`) → `Location` (geo-coordinates + taken date) → `Item` (media file with
`downloadUrl` / `thumbnailUrl`)

Navigation: `CollectionList` → `LocationList` → `ItemList` → `MapAndLocation` (map view, filtered by `?id=` and `?year=`)

Routes are **nested**, not query-param based:
```
/collections
/collections/:collectionId/locations
/collections/:collectionId/locations/:locationId/items
```
URL params are accessed via `useParams()`: `collectionId` and `locationId`. `PathName` constants are in `src/constants/Page.ts`.

## Provider Stack (outermost → innermost, see `src/index.tsx`)

1. `QueryClientProvider` – TanStack Query (retry: 1, no refetch-on-focus)
2. `AppProvider` – `currentUser`, `currentLanguage` (default `'vn'`)
3. `AppLoaderProvider` – full-screen loader overlay (`useAppLoaderContext`)
4. `AppSnackbarProvider` – bottom-center MUI Snackbar (`useAppSnackbarContext`)
5. `AudioProvider` – Howler.js background music, random shuffle
6. `BrowserRouter`

`SidebarProvider` is **local** to authenticated pages only (wraps `AppToolbar` + `Sidebar` in `App.tsx`).

## Route Layout

- **Public** (`/`, `memoria`, `about-me`, `faq`, `privacy-policy`) – render `<Header/>`
- **Protected** (`map`, `collections`, `locations`, `item`, `profile`) – render `<AppToolbar/>` + `<Sidebar/>` inside
  `SidebarProvider`; guard is `<Protected>` which checks for the `ACCESS_TOKEN` cookie or shows `<SessionExpireDialog/>`

## Query Hooks Pattern (`src/queries/`)

Each entity has a dedicated hook file. Mutations use TanStack Query v5's `mutate(payload, { onSuccess, onError })`
call-site pattern — **not** constructor callbacks. Pages call `queryClient.invalidateQueries(...)` to refresh. Example:

```ts
const createMutation = useCreateCollectionMutation();

createMutation.mutate(collection, {
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['getAllCollectionsHavingAccess'] });
        openSnackbar('success', t('collection.save_success'));
        onClose();
    },
    onError: () => {
        openSnackbar('error', t('collection.save_error'));
    }
});
```

Paginated responses expose total count via the `x-total-count` response header, returned as
`{ header: AxiosHeaders, data: T[] }`.

Available query hooks per entity:
- `useCollectionQueries.ts` – `useCollectionQuery`, `useCollectionByIdQuery`, `useUserEmailsCollectionQuery`, `useYearsOfCollectionQuery`, `useCreateCollectionMutation`, `useUpdateCollectionMutation`, `useDeleteCollectionMutation`
- `useLocationQueries.ts` – `useAllLocationsQuery`, `usePagingLocationQuery`, `useLocationByIdQuery`, `useCreateLocationMutation`, `useUpdateLocationMutation`, `useDeleteLocationMutation`
- `useItemQueries.ts` – `useItemQuery(locationId, thumbnailSize)` where `thumbnailSize` is `"large" | "medium" | "small"`
- `useUserQueries.ts` – `useUserQuery()`

## Responsive Layout Pattern

- JS breakpoint: `isTabletOrPhone()` from `src/utils/ScreenUtil.ts` → `window.innerWidth <= MOBILE_MAX_WIDTH` (900, defined in `src/constants/index.ts`)
- SCSS breakpoint mixin: `@include respond(tablet)` in `src/assets/styles/_breakpoint.scss`
- Pages render **Card layout** (mobile) or **Table layout** (desktop) based on `isTabletOrPhone()`
- Mobile item list uses `react-slick` `<Slider>` for swipeable image/video browsing

## Styling Conventions

- Per-component `.scss` files co-located with the component
- Global SCSS tokens: `src/assets/styles/_color.scss` (MUI palette-named variables), `_breakpoint.scss`
- MUI v7 is the primary component library; custom overrides in `src/assets/styles/_custom-mui.scss`
- `@mui/x-date-pickers` (with `AdapterDateFns`) is used for the `TimePicker` in `LocationDialog`
- There is **no `@components` path alias** — import shared components via relative paths (e.g., `../../components/app-loader/AppLoader`)

## i18n

Two locales: `vn` (default/fallback) and `en`. Translation files in `src/translation/en.json` and `vi.json`. Use
`useTranslation()` hook; add new keys to **both** files. Language code for Vietnamese is `'vn'` (not `'vi'`), but the
translation file on disk is `vi.json` (not `vn.json`).

## Leaflet Map Notes

- Custom marker icons (`red-marker.webp`, `blue-marker.webp`) are loaded from `public/` via `import.meta.env.BASE_URL`
- Icon sizes differ for tablet/phone vs desktop
- `ChangeView` component uses `useMap()` hook to imperatively call `map.fitBounds()` or `map.setView()`

## 360° & Video Media

- Items with `mimeType` containing `"image"` and `name` prefixed `IMG360` are rendered as equirectangular photos via
  `ReactPhotoSphereViewer` with `GyroscopePlugin`
- Items with `name` prefixed `VID360` are rendered as 360° videos via `EquirectangularVideoAdapter` + `VideoPlugin`
- On mobile, regular photos/videos use `react-slick` `<Slider>`; tapping an `IMG360`/`VID360` opens a full-screen
  360° overlay dialog
- PSV instance is accessed via `psvRef` (`ViewerAPI`) to stop video before navigating away
- CSS imports required: `react-photo-sphere-viewer/dist/index.css`, `@photo-sphere-viewer/core/index.css`,
  `@photo-sphere-viewer/video-plugin/index.css`

## Testing

Vitest + jsdom + `@testing-library/react`. Setup file: `src/setupTests.ts`. Tests run with `globals: true` so no
explicit imports of `describe`/`it`/`expect` are needed.

