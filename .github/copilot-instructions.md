# GymSetTracker AI Agent Instructions

This document provides essential knowledge for AI agents working with the GymSetTracker codebase, a minimalist strength training tracking application.

## Project Overview

GymSetTracker is a web application for tracking strength training progress, built with:
- Backend: Spring Boot (Java 17)
- Frontend: React + TypeScript + Vite
- Database: PostgreSQL
- Authentication: JWT

The project emphasizes minimalism and performance, as it's designed to run on a Raspberry Pi Zero 2W.

## Key Architecture Patterns

### Backend (Spring Boot)

1. **Package Structure**:
   - `com.treningi.app.controller` - REST endpoints
   - `com.treningi.app.service` - Business logic
   - `com.treningi.app.repository` - Data access layer
   - `com.treningi.app.entity` - Domain models
   - `com.treningi.app.dto` - Request/response objects
   - `com.treningi.app.security` - JWT authentication

2. **Entity Relationships**:
   - `User` ← one-to-many → `Workout`
   - `Workout` ← one-to-many → `WorkoutSet`
   - `Exercise` ← many-to-many → `WorkoutSet`
   - `User` ← one-to-many → `PersonalRecord`

3. **Authentication Flow**:
   - All endpoints except `/api/auth/**` require JWT token
   - Token must be included in `Authorization: Bearer {token}` header

### Frontend (React + TypeScript)

1. **Project Structure**:
   - `src/components/` - Reusable UI components
   - `src/services/` - API integration layer
   - `src/hooks/` - Custom React hooks
   - `src/pages/` - Route components
   - `src/types/` - TypeScript interfaces
   - `src/utils/` - Helper functions

2. **State Management**:
   - React Query for server state
   - Context API for auth state
   - Local state for form handling

## Development Workflow

1. **Backend Development**:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

2. **Frontend Development**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## Common Tasks

### Adding a New Exercise Type

1. Add to `data.sql` if it's a default exercise
2. Update `ExerciseController` if special handling needed
3. Ensure proper muscle group categorization

### Implementing New Workout Features

1. Define DTO in `backend/src/.../dto`
2. Add endpoint in relevant controller
3. Implement service logic
4. Create TypeScript types in `frontend/src/types`
5. Add API method in `frontend/src/services`

## Performance Considerations

1. **Database Queries**:
   - Use pagination for workout lists
   - Leverage indexes on user_id and date columns
   - Avoid N+1 queries with proper JPA fetching

2. **Frontend Optimization**:
   - Lazy load route components
   - Implement virtual scrolling for long lists
   - Cache API responses with React Query

## Testing Guidelines

1. **Backend Tests**:
   - Unit tests for services
   - Integration tests for controllers
   - Repository tests with test database

2. **Frontend Tests**:
   - Component tests with React Testing Library
   - API mocking with MSW
   - E2E tests with Cypress (future)

## Error Handling

1. **Backend**:
   - Use `GlobalExceptionHandler` for consistent error responses
   - Return appropriate HTTP status codes
   - Include meaningful error messages

2. **Frontend**:
   - Handle API errors with React Query error callbacks
   - Show user-friendly error messages
   - Implement retry logic for transient failures

## Documentation

- API endpoints documented in LLD.md
- Database schema in HLD.md
- Business requirements in Analysis MVP.md

## Version Control

- Feature branches from `main`
- PR required for main branch changes
- Follow conventional commits