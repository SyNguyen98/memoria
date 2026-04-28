# Memoria Frontend

[![Azure Static Web Apps CI/CD](https://github.com/SyNguyen98/memoria-fe/actions/workflows/azure-static-web-apps.yml/badge.svg)](https://github.com/SyNguyen98/memoria-fe/actions/workflows/azure-static-web-apps.yml)

A React 19 + Vite SPA for storing and browsing personal memories — photos and 360° media — organised into *
*Collections → Locations → Items**. Authentication is handled via Google OAuth2; all data is served by a separate Spring
Boot backend.

## Tech Stack

| Layer        | Technology                               |
|--------------|------------------------------------------|
| UI Framework | React 19, MUI v7                         |
| Build Tool   | Vite 8 + TypeScript                      |
| Routing      | React Router v7                          |
| Server State | TanStack Query v5                        |
| Map          | React-Leaflet + OpenStreetMap            |
| 360° Media   | react-photo-sphere-viewer                |
| Audio        | Howler.js                                |
| i18n         | i18next (Vietnamese `vn` + English `en`) |
| Testing      | Vitest + jsdom + Testing Library         |
| Styling      | SCSS modules + MUI theming               |
| Deployment   | Azure Static Web Apps                    |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A running instance of the [Memoria backend](https://github.com/SyNguyen98/memoria-fe) (Spring Boot)

### Installation

```bash
git clone https://github.com/SyNguyen98/memoria-fe.git
cd memoria-fe
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_BACKEND_URL=http://localhost:8080   # Spring Boot backend base URL
VITE_BASENAME=                           # BrowserRouter basename (leave empty for root deployment)
```

### Running Locally

```bash
npm run dev        # Dev server at http://localhost:5173
```

## Scripts

| Command             | Description                                           |
|---------------------|-------------------------------------------------------|
| `npm run dev`       | Start Vite dev server                                 |
| `npm run build`     | Production build (`tsc -b && vite build --mode prod`) |
| `npm run build-dev` | Development build (`tsc && vite build --mode dev`)    |
| `npm run preview`   | Preview the production build locally                  |
| `npm run lint`      | Run ESLint                                            |
| `npm run test`      | Run Vitest in watch mode                              |

## Features

- **Memory timeline** – Browse memories grouped by Collection, then Location (with coordinates and taken-date), then
  media Items
- **Interactive map** – Leaflet map with all locations pinned; filter by collection and year
- **360° & video viewer** – Equirectangular photo and video playback via Photo Sphere Viewer
- **Collection sharing** – Collections can be shared with other users by email
- **Background music** – Random-shuffle Howler.js audio player built into the app shell
- **Responsive layout** – Card layout on mobile (≤ 900 px), Table layout on desktop
- **Bilingual UI** – Vietnamese (default) and English

## Project Structure

```
src/
├── api/            # Axios instance (appAxios) with auth interceptor
├── assets/styles/  # Global SCSS tokens (_color.scss, _breakpoint.scss)
├── components/     # Shared components (AppToolbar, Sidebar, Header, …)
├── constants/      # PathName, CookieKey, Tag list, URLs
├── models/         # TypeScript interfaces (Collection, Location, Item, User)
├── pages/          # Route-level page components
├── providers/      # React context providers (App, Loader, Snackbar, Audio, Sidebar)
├── queries/        # TanStack Query hooks per entity
├── translation/    # i18n JSON files (en.json, vi.json)
└── utils/          # CookieUtil, DateUtil, ScreenUtil
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

## License

Private repository — all rights reserved.
