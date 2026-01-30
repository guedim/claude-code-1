# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Platziflix is a multi-platform online course platform with:
- **Backend**: FastAPI + PostgreSQL (Docker-based)
- **Frontend**: Next.js 15 (App Router) + TypeScript + SCSS
- **Mobile**: Android (Kotlin) + iOS (Swift)

## Development Commands

### Backend (requires Docker)
```bash
cd Backend
make start              # Start containers
make stop               # Stop containers
make logs               # View logs
make migrate            # Run database migrations
make seed               # Seed sample data
make seed-fresh         # Clear and reseed data
make create-migration   # Create new migration (interactive)
```

**CRITICAL**: All backend commands must run inside the Docker container. Always verify containers are running with `make start` before executing other commands.

### Frontend
```bash
cd Frontend
yarn dev                # Dev server (Turbopack)
yarn build              # Production build
yarn lint               # Run linter
yarn test               # Run all tests
yarn test ComponentName # Run single test file
```

### Running Single Tests
```bash
# Frontend - run specific test file
cd Frontend && yarn test src/components/CourseCard/CourseCard.test.tsx

# Frontend - run tests matching pattern
cd Frontend && yarn test --grep "CourseCard"
```

## Architecture

### Data Model
- **Course** ↔ **Teacher** (Many-to-Many via course_teachers)
- **Course** → **Lesson** → **Class** (One-to-Many chain)

### Backend Patterns
- Service Layer Pattern with FastAPI dependency injection
- Repository Pattern with SQLAlchemy 2.0
- Type hints required on all functions
- Use Pydantic models for validation (not raw dicts)
- Early returns for error handling, happy path last

### Frontend Patterns
- Server Components by default, Client Components only when needed
- CSS Modules with SCSS (`.module.scss`)
- Component structure: `src/components/ComponentName/`
  - `ComponentName.tsx`
  - `ComponentName.module.scss`
  - `ComponentName.test.tsx`
- Import shared types from `@/types`
- Use `color('name')` function from `styles/vars.scss`

### Mobile Patterns
- **Android**: MVVM + ViewBinding + Flow/LiveData + Material 3
- **iOS**: MVVM + SwiftUI + async/await + Repository Pattern

## Code Conventions

- **Python**: snake_case for files/variables
- **TypeScript**: camelCase for variables, PascalCase for components
- **Swift/Kotlin**: PascalCase for types, camelCase for variables

## URLs

- Backend API: http://localhost:8000
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs