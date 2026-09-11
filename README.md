# DogLog API

DogLog API is a REST API for logging dogs and their training sessions.

The project is built with Node.js, TypeScript, Express, SQLite, Zod, Vitest, and Supertest.

## Project Information

- Author: Kim Safsten
- Class: SYS25D
- Course: API-utveckling Node.js
- School: Medieinstitutet

## Features

- CRUD for dogs
- CRUD for training sessions
- Filtering sessions by `dogId`, `activity`, and `date`
- Pagination for `GET /sessions` with `limit` and `page`
- Request validation with Zod
- Swagger/OpenAPI documentation at `/api-docs`
- Automatic development seed data on first startup
- Automated tests with Vitest and Supertest

## Tech Stack

- Node.js
- TypeScript
- Express 5
- SQLite with `better-sqlite3`
- Zod
- Vitest
- Supertest
- Swagger UI Express

## Getting Started

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

The API starts on `http://localhost:3000` by default.

### Build the project

```bash
npm run build
```

### Run the built version

```bash
npm start
```

### Run tests

```bash
npm test
```

## API Documentation

Swagger UI is available at:

```text
http://localhost:3000/api-docs
```

## Seed Data

When the app starts in development, it automatically seeds the SQLite database the first time if the `dogs` table is empty.

The seed includes:

- two dogs
- multiple training sessions
- different activities and dates

Seed data is skipped in tests because the test environment uses a clean in-memory database.

## Endpoints

### Health

- `GET /health`

### Dogs

- `GET /dogs`
- `GET /dogs/:id`
- `POST /dogs`
- `PATCH /dogs/:id`
- `DELETE /dogs/:id`

Example request body for `POST /dogs`:

```json
{
  "name": "Luna",
  "breed": "Border Collie"
}
```

### Sessions

- `GET /sessions`
- `GET /sessions/:id`
- `POST /sessions`
- `PATCH /sessions/:id`
- `DELETE /sessions/:id`

Supported query parameters for `GET /sessions`:

- `dogId`
- `activity`
- `date`
- `limit`
- `page`

Example request body for `POST /sessions`:

```json
{
  "dogId": 1,
  "date": "2026-09-07",
  "activity": "Agility",
  "durationMinutes": 30,
  "notes": "Bra fokus",
  "progress": "Sakrare i slalom",
  "focusNextTime": "Trana starter"
}
```

## Validation and Errors

The API validates request bodies and query parameters.

Examples of handled errors:

- `VALIDATION_ERROR`
- `DOG_NOT_FOUND`
- `DOG_ALREADY_EXISTS`
- `SESSION_NOT_FOUND`

## Project Structure

```text
src/
  app.ts
  database.ts
  openapi.ts
  seed.ts
  routes/
  schemas/

tests/
  dogs/
  sessions/
  helpers/
```

## Notes

- The development database is stored in `doglog.db`.
- The test suite uses an in-memory SQLite database.
- Deleting a dog also deletes its training sessions through foreign key cascade delete.
