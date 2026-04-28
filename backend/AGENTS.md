# Memoria Backend – Agent Guide

## Architecture Overview

Spring Boot 4 REST API (Java 25) backed by **MongoDB Atlas** for a photo-memory application. Users authenticate via **Google OAuth2** (Spring Security) and the app integrates with **Microsoft OneDrive** (via Microsoft Graph API) to store media files. Each `Collection` maps 1-to-1 to an OneDrive folder via `driveItemId`.

**Core domain model:**
- `Collection` → groups of memories, owned by one user (`ownerEmail`), shared with others (`userEmails`), linked to an OneDrive folder (`driveItemId`)
- `Location` → geotagged photo locations belonging to a collection
- `Item` → individual media items within a location
- `User` → registered OAuth2 user (Google or Microsoft)

## Package Structure

```
controllers/   → REST endpoints (@RestController), use @CurrentUser UserPrincipal
services/      → Business logic, ownership/permission checks, calls MicrosoftGraphClient
repositories/  → Spring Data MongoDB interfaces
converters/    → MapStruct interfaces (Model ↔ Record), compiled to *ConverterImpl
dtos/          → Java records used as request/response bodies (e.g. CollectionRecord)
models/        → MongoDB @Document entities (Lombok @Data @Builder)
client/        → Feign clients: IMicrosoftGraphClient (OneDrive), OpenStreetMapClient
security/      → JWT token filter, OAuth2 handlers, @CurrentUser annotation
configs/       → SecurityConfig, FeignConfig
properties/    → @ConfigurationProperties classes (ApplicationProperties, MemoriaProperties)
constants/     → Enums: Tag, AuthProvider
exceptions/    → BadRequestException, ForbiddenException, ResourceNotFoundException
```

## Key Patterns

**Authentication:** All `/api/**` endpoints require a Bearer JWT token. The `@CurrentUser UserPrincipal` parameter resolves the authenticated user. Tokens are issued after OAuth2 login via `TokenProvider` (RSA key pair in `application.yml`).

**DTOs are Java records** annotated with `@JsonInclude(NON_NULL)`. MapStruct converters (`CollectionConverter`, `ItemConverter`, etc.) translate between records and entities. Always define converters as interfaces – MapStruct generates the `*ConverterImpl`.

**Ownership checks happen in services**, not controllers. Pattern:
```java
if (!collection.getOwnerEmail().equals(userEmail)) {
    throw new ForbiddenException("...");
}
```

**OneDrive integration:** Creating a `Collection` automatically creates an OneDrive folder via `MicrosoftGraphClient.createFolderInDriveItem(ROOT_DRIVE_ITEM_ID, name)`. The returned `driveItemId` is stored on the entity and indexed as unique.

**Pagination:** Controllers return `Page<Entity>` converted to a list; pagination headers (`X-Total-Count`, links) are added via `PaginationUtil.generatePaginationHttpHeaders(...)`. CORS exposes the `X-Total-Count` header.

**Microsoft token exchange:** `MicrosoftGraphClient` (wrapper, not the Feign interface) handles the OAuth2 token flow using `memoria.microsoft.clientId/clientSecret` from config.

## Developer Workflows

**Build:**
```bash
./mvnw clean package
```

**Run locally** (uses `application-local.yml` with real credentials):
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

**Environment variables required for non-local profiles:**
- `MONGODB_PASSWORD` – MongoDB Atlas password

**Swagger UI** (when running): `http://localhost:8080/swagger-ui.html`

## Configuration

- `application.yml` – base config with placeholder credentials; JWT RSA keys embedded inline
- `application-local.yml` – real credentials for local dev (Google OAuth2, Microsoft app, MongoDB URI)
- CORS origins and OAuth2 redirect URIs configured under `application.corsOrigins` and `application.oauth2.authorizedRedirectUris`

## Adding a New Resource

1. Create a `@Document` model in `models/`
2. Create a Java record DTO in `dtos/`
3. Create a MapStruct interface in `converters/` (implement generates automatically)
4. Create a Spring Data `Repository` in `repositories/`
5. Add a `@Service` with ownership/permission logic
6. Add a `@RestController` using `@CurrentUser UserPrincipal` for auth context

