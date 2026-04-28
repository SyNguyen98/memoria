# Memoria

[![Deploy to Azure Web App](https://github.com/SyNguyen98/memoria/actions/workflows/deploy-azure-web-app.yml/badge.svg)](https://github.com/SyNguyen98/memoria/actions/workflows/deploy-azure-web-app.yml) [![Deploy to Azure Static Web Apps](https://github.com/SyNguyen98/memoria/actions/workflows/deploy-azure-static-web-apps.yml/badge.svg)](https://github.com/SyNguyen98/memoria/actions/workflows/deploy-azure-static-web-apps.yml)

A full-stack web application for storing, organizing, and browsing personal photo memories — geotagged and grouped into **Collections → Locations → Items**. Users sign in with Google OAuth2 and media files are stored in Microsoft OneDrive.

## Repository Structure

```
memoria/
├── backend/    # Spring Boot 4 REST API (Java 25)
├── frontend/   # React 19 + Vite SPA (TypeScript)
└── Dockerfile  # Multi-stage build for both services
```

## Features

- **Google OAuth2** login with stateless JWT (RSA) authentication
- **Collections** — top-level albums that map 1-to-1 to a OneDrive folder
- **Locations** — geotagged places (with OpenStreetMap reverse-geocoding) inside a Collection
- **Items** — photos and 360° / video media inside a Location
- **Interactive Leaflet map** — all locations pinned, filterable by collection and year
- **360° & video viewer** — equirectangular photo/video playback via Photo Sphere Viewer
- **Collection sharing** — share with other users by email (role-based access control)
- **Background music** — shuffle audio player built into the app shell (Howler.js)
- **Bilingual UI** — Vietnamese (default) and English (i18next)
- **Responsive layout** — card view on mobile, table view on desktop

## Tech Stack

### Backend

| Layer        | Technology                                  |
|--------------|---------------------------------------------|
| Language     | Java 25                                     |
| Framework    | Spring Boot 4                               |
| Database     | MongoDB Atlas                               |
| Auth         | Spring Security · Google OAuth2 · JWT (RSA) |
| HTTP clients | Spring Cloud OpenFeign + OkHttp             |
| Mapping      | MapStruct 1.6                               |
| API docs     | SpringDoc OpenAPI 3 (Swagger UI)            |
| Build        | Maven Wrapper                               |

### Frontend

| Layer        | Technology                               |
|--------------|------------------------------------------|
| UI Framework | React 19, MUI v9                         |
| Build Tool   | Vite 8 + TypeScript                      |
| Routing      | React Router v7                          |
| Server State | TanStack Query v5                        |
| Map          | React-Leaflet + OpenStreetMap            |
| 360° Media   | react-photo-sphere-viewer                |
| Audio        | Howler.js                                |
| i18n         | i18next (Vietnamese + English)           |
| Testing      | Vitest + jsdom + Testing Library         |
| Styling      | SCSS modules + MUI theming               |

## Getting Started

### Prerequisites

- **JDK 25** and Maven (or use the included `mvnw` wrapper)
- **Node.js ≥ 18**
- A **MongoDB Atlas** cluster
- A **Google OAuth2** application (client ID & secret)
- A **Microsoft Entra** app registration with OneDrive/Graph API permissions

### Running the Backend

```bash
cd backend
# Copy and fill in your credentials
cp src/main/resources/application-local.yml.example src/main/resources/application-local.yml

./mvnw spring-boot:run -Dspring-boot.run.profiles=local
# API available at http://localhost:8080
# Swagger UI at  http://localhost:8080/swagger-ui.html
```

Key environment variables (non-local profiles):

| Variable           | Description            |
|--------------------|------------------------|
| `MONGODB_PASSWORD` | MongoDB Atlas password |

### Running the Frontend

```bash
cd frontend
npm install

# Create .env.local with:
# VITE_BACKEND_URL=http://localhost:8080
# VITE_BASENAME=

npm run dev
# Dev server at http://localhost:5173
```

### Frontend Scripts

| Command             | Description                        |
|---------------------|------------------------------------|
| `npm run dev`       | Start Vite dev server              |
| `npm run build`     | Production build                   |
| `npm run build-dev` | Development build                  |
| `npm run preview`   | Preview the production build       |
| `npm run lint`      | Run ESLint                         |
| `npm run test`      | Run Vitest in watch mode           |

## Docker

A multi-stage `Dockerfile` at the repository root builds both services independently.

```bash
# Build and run the backend
docker build --target backend -t memoria-backend .
docker run -p 8080:8080 -e MONGODB_PASSWORD=<password> memoria-backend

# Build and run the frontend (nginx)
docker build --target frontend -t memoria-frontend .
docker run -p 80:80 memoria-frontend
```

## Authentication Flow

1. Redirect the user to `GET /oauth2/authorize/google`
2. After the Google callback the server issues a JWT via the configured redirect URI
3. Include the token on every API request: `Authorization: Bearer <token>`

## API Overview

All `/api/**` endpoints require a valid JWT bearer token.

| Resource    | Base path          | Description                                          |
|-------------|--------------------|------------------------------------------------------|
| Users       | `/api/users/me`    | Current authenticated user info                      |
| Collections | `/api/collections` | CRUD for photo collections; manages OneDrive folders |
| Locations   | `/api/locations`   | Geo-tagged locations within a collection             |
| Items       | `/api/items`       | Media items (photos/videos) within a location        |

Full interactive docs: **`http://localhost:8080/swagger-ui.html`**

## Deployment

The project is deployed to Azure:

- **Backend** → Azure Web App (via GitHub Actions: `.github/workflows/deploy-azure-web-app.yml`)
- **Frontend** → Azure Static Web Apps (via GitHub Actions: `.github/workflows/azure-static-web-apps.yml`)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

## License

Private repository — all rights reserved.

