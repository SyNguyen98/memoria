# MEMORIA BACKEND

[![Build status](https://github.com/SyNguyen98/memoria-be/actions/workflows/deploy-azure-web-app.yml/badge.svg?branch=master)](https://github.com/SyNguyen98/memoria-be/actions/workflows/deploy-azure-web-app.yml)

REST API backend for the Memoria photo-memory application, built with Spring Boot 4 and Java 25.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Configuration](#configuration)
- [API Overview](#api-overview)
- [Deployment](#deployment)

## Introduction

Memoria Backend provides a secure REST API that lets users organize geotagged photo memories into **Collections**, *
*Locations**, and **Items**. Media files are stored in Microsoft OneDrive; every Collection maps 1-to-1 to a OneDrive
folder. Users sign in through Google OAuth2 and receive a JWT token for subsequent requests.

## Features

- Google OAuth2 login with stateless JWT authentication
- CRUD for Collections, Locations, and Items
- Microsoft OneDrive integration – folder creation, file upload, and deletion via Microsoft Graph API
- Role-based access control: owners can share collections with other users by email
- Geotagged locations with OpenStreetMap reverse-geocoding
- Pagination with `X-Total-Count` response header
- OpenAPI / Swagger UI at `/swagger-ui.html`

## Tech Stack

| Layer        | Technology                                  |
|--------------|---------------------------------------------|
| Language     | Java 25                                     |
| Framework    | Spring Boot 4                               |
| Database     | MongoDB Atlas                               |
| Auth         | Spring Security · Google OAuth2 · JWT (RSA) |
| HTTP clients | Spring Cloud OpenFeign + OkHttp             |
| Mapping      | MapStruct 1.6                               |
| Boilerplate  | Lombok                                      |
| API docs     | SpringDoc OpenAPI 3                         |
| Build        | Maven Wrapper                               |

## Getting Started

### Prerequisites

- JDK 25
- Maven (or use the included `mvnw` wrapper)
- A MongoDB Atlas cluster
- A Google OAuth2 application (client ID & secret)
- A Microsoft Entra app registration with OneDrive permissions (client ID & secret)

### Installation

```bash
git clone https://github.com/SyNguyen98/memoria-be.git
cd memoria-be
./mvnw clean install
```

### Configuration

The application uses two config files:

| File                                       | Purpose                                                       |
|--------------------------------------------|---------------------------------------------------------------|
| `src/main/resources/application.yml`       | Base config with placeholder values and embedded JWT RSA keys |
| `src/main/resources/application-local.yml` | Real credentials for local development (not committed to VCS) |

**Run locally** (activates `application-local.yml`):

```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

**Required environment variables** (for non-local profiles):

| Variable           | Description            |
|--------------------|------------------------|
| `MONGODB_PASSWORD` | MongoDB Atlas password |

Key config namespaces:

```yaml
spring.security.oauth2.client.registration.google:   # Google OAuth2 credentials
memoria.microsoft:                                    # Microsoft app client ID & secret
application.corsOrigins:                              # Allowed CORS origins
application.oauth2.authorizedRedirectUris:            # Post-login redirect URIs
application.security:                                 # JWT token expiry & RSA keys
```

## API Overview

All `/api/**` endpoints require a `Bearer <JWT>` token in the `Authorization` header.

| Resource    | Base path          | Description                                          |
|-------------|--------------------|------------------------------------------------------|
| Users       | `/api/users/me`    | Current authenticated user info                      |
| Collections | `/api/collections` | CRUD for photo collections; manages OneDrive folders |
| Locations   | `/api/locations`   | Geo-tagged locations within a collection             |
| Items       | `/api/items`       | Media items (photos) within a location               |

Interactive API docs: **`http://localhost:8080/swagger-ui.html`**

OAuth2 flow:

1. Redirect the user to `/oauth2/authorize/google`
2. After Google callback the server returns a JWT via the configured redirect URI
3. Include the JWT as `Authorization: Bearer <token>` on every API request

## Deployment

The project ships with a `Dockerfile` and a GitHub Actions workflow (`.github/workflows/deploy-azure-web-app.yml`) that
builds and deploys to Azure Web App on every push to `master`.

**Build the JAR:**

```bash
./mvnw clean package
```

**Build & run the Docker image:**

```bash
docker build -t memoria-be .
docker run -p 8080:8080 -e MONGODB_PASSWORD=<password> memoria-be
```
