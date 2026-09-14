# DogLog API

DogLog API is a REST API for logging dogs and their training sessions.

The project is built with Node.js, TypeScript, Express, SQLite, Zod, Vitest, and Supertest.

## Project Information

- Author: Kim Säfsten
- Class: SYS25D
- Course: API-utveckling Node.js
- School: Medieinstitutet

## Features

- CRUD for dogs
- CRUD for training sessions
- Filtering sessions by `dogId`, `activity`, and `date`
- Pagination metadata for `GET /sessions` with `limit` and `page`
- Request validation with Zod
- Swagger/OpenAPI documentation at `/api-docs`
- Automatic seed data on startup outside test mode when the database is empty
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

### Prerequisites

- Node.js 24.x
- npm

### Install dependencies

```bash
npm install
```

### Run in development

```bash
npm run dev
```

The API reads `PORT` from the environment and otherwise starts on `http://localhost:3000`.
The SQLite database file is created in the project root as `doglog.db`.

### Build the project

```bash
npm run build
```

### Run the built version

```bash
npm start
```

`npm run dev` and `npm start` both use the same `doglog.db` file.

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

When the app starts outside test mode, it automatically seeds the SQLite database if the `dogs` table is empty.

The seed includes:

- two dogs
- multiple training sessions
- different activities and dates

Seed data is skipped only when `NODE_ENV === "test"`, because the test environment uses a clean in-memory database.
If you delete all dogs from `doglog.db` and restart the app, the demo dogs and sessions are inserted again.

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
- `limit` defaults to `10`
- `page` defaults to `1`

Response format for `GET /sessions`:

```json
{
  "data": [
    {
      "id": 1,
      "dogId": 1,
      "date": "2026-09-07",
      "activity": "Agility",
      "durationMinutes": 30,
      "notes": "Bra fokus",
      "progress": "Säkrare i slalom",
      "focusNextTime": "Träna starter"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

Example request body for `POST /sessions`:

```json
{
  "dogId": 1,
  "date": "2026-09-07",
  "activity": "Agility",
  "durationMinutes": 30,
  "notes": "Bra fokus",
  "progress": "Säkrare i slalom",
  "focusNextTime": "Träna starter"
}
```

## Validation and Errors

The API validates request bodies and query parameters.

Handled application errors include:

- `VALIDATION_ERROR`
- `DOG_NOT_FOUND`
- `DOG_ALREADY_EXISTS`
- `SESSION_NOT_FOUND`

Unexpected errors return status `500` with the error code `INTERNAL_SERVER_ERROR`.

## Project Structure

```text
src/
  app.ts
  database.ts
  seed.ts
  middleware/
  openapi/
  routes/
  schemas/

tests/
  dogs/
  sessions/
  helpers/
```

## Notes

- The development and production app both use `doglog.db` unless `NODE_ENV === "test"`.
- The test suite uses an in-memory SQLite database.
- Deleting a dog also deletes its training sessions through foreign key cascade delete.
