# ========================
# Stage 1: Build Frontend
# ========================
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# ========================
# Stage 2: Build Backend
# ========================
FROM eclipse-temurin:21-jdk-alpine AS backend-build

WORKDIR /app/backend

COPY backend/mvnw backend/pom.xml ./
COPY backend/.mvn .mvn
RUN ./mvnw dependency:go-offline -q

COPY backend/src ./src
RUN ./mvnw package -DskipTests -q

# ========================
# Stage 3: Frontend Runtime
# ========================
FROM nginx:alpine AS frontend

COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# ========================
# Stage 4: Backend Runtime
# ========================
FROM eclipse-temurin:21-jre-alpine AS backend

WORKDIR /app

COPY --from=backend-build /app/backend/target/memoria-1.0.0.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]

