# GymSetTracker

GymSetTracker is a minimalist strength-training logging web application. It provides a Spring Boot backend (Java 17) with JWT authentication and a React + TypeScript frontend (Vite).

## Tech stack

- Backend: Spring Boot (Java 17), Spring Security, Spring Data JPA
- Database: PostgreSQL
- Authentication: JWT
- Frontend: React + TypeScript + Vite, Material UI

## Repository layout

- `backend/` — Spring Boot application (Maven)
- `frontend/` — React + TypeScript (Vite)

## Quick start (development)

Prerequisites:

- JDK 17
- Node.js (16+ recommended)
- PostgreSQL (or run with a local/postgres instance)

Backend (from repository root):

```bash
cd backend
./mvnw spring-boot:run
```

Notes:
- The backend reads configuration from `src/main/resources/application.properties`. If you use a local Postgres instance, update the JDBC URL, username, and password there.
- Default data and lookup values may be pre-seeded in `src/main/resources/db/data.sql`.

Frontend (from repository root):

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on Vite (default port 5173). Ensure the backend is running and that the frontend's API base URL (in `src/utils/axios.ts`) points to the backend server.

## Architecture highlights

- Package structure (backend): `controller`, `service`, `repository`, `entity`, `dto`, `security`.
- Key relationships: User -> Workout -> WorkoutSet; Exercise <-> WorkoutSet; User -> PersonalRecord.
- All endpoints except `/api/auth/**` require a Bearer JWT token sent in the `Authorization` header.

## Development notes & conventions

- Frontend state: React Query for server state + Context API for auth.
- When adding frontend form or interactive elements, include a stable `data-test-id` attribute using kebab-case (e.g. `input--profile--email`).
- Keep backend DTOs and frontend `src/types` in sync when changing API payloads.

## Contributing

- Create feature branches from `main` and open a PR for review.
- If your change affects any items mentioned in this README (for example: API endpoints, authentication flow, DB schema, run/setup commands, default seeded data), update this README with a short note describing the change and any migration or verification steps.

## Where to find things

- Backend entrypoint: `backend/src/main/java/com/treningi/app/GymSetTrackerApplication.java`
- Backend config examples: `backend/src/main/resources/application.properties`
- Frontend entrypoint: `frontend/src/main.tsx`
- Frontend services: `frontend/src/services/*`

## Troubleshooting

- If `npm run dev` fails in `frontend/`, run `npm install` first and ensure Node is a supported version.
- If backend fails to start due to DB connection errors, ensure Postgres is reachable and the configuration in `application.properties` is correct.

## License

This repository does not include a license file. Add an appropriate LICENSE if you intend to publish or share the project.

---
Last updated: (see commit history)
