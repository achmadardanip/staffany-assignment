# StaffAny Scheduler Assignment

This project implements the StaffAny scheduling experience with a Hapi.js + TypeORM backend and a React + Material UI frontend. It fulfils all functional requirements for managing shifts, detecting and overriding clashes, and publishing weekly schedules.

## Monorepo Structure

```
./backend   # Hapi.js API and TypeORM data layer
./frontend  # React SPA with Material UI and Redux Toolkit state
```

Both projects keep their original starter layout. Enhancements are layered on top of the existing code base so that it remains familiar to the starter scaffold.

---

## 1. Prerequisites

| Tool        | Version (tested) |
|-------------|------------------|
| Node.js     | 22.x             |
| npm         | 10.x             |
| PostgreSQL  | 14+              |

Ensure PostgreSQL is running locally and reachable with the credentials stored in `backend/.env`.

---

## 2. Environment Variables

### Backend (`backend/.env`)

```
PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=staffany_scheduler
```

All variables map directly to the TypeORM connection configuration. Update them if your local database differs.

### Frontend (`frontend/.env`)

```
REACT_APP_API_BASE_URL=http://localhost:8000/v1
```

The frontend proxies every API request to this base URL.

---

## 3. Installation & Running

### Backend

```bash
cd backend
npm install
npm run dev            # starts Hapi in watch mode on http://localhost:8000
```

Optional helper to create the development database:

```bash
./createdb.sh          # requires psql on PATH
```

### Frontend

```bash
cd frontend
npm install
npm run start          # starts CRA dev server on http://localhost:3000
```

Both servers must be running for the SPA to communicate with the API.

---

## 4. Backend Technical Documentation

### 4.1 Entities

- **Shift** (`src/database/default/entity/shift.ts`)
  - Fields: `id`, `name`, `date`, `startTime`, `endTime`, `weekId`
  - Relationships: `ManyToOne` to `Week`
- **Week** (`src/database/default/entity/week.ts`)
  - Fields: `id`, `startDate` (Monday), `endDate` (Sunday), `isPublished`, `publishedAt`
  - Relationships: `OneToMany` to `Shift`

### 4.2 Business Rules

- Clash detection spans the target date plus the neighbouring days to account for shifts that cross midnight.
- A clash occurs when two shifts overlap in time (inclusive of overnight spans). Touching endpoints (e.g. one ends exactly when another starts) are allowed.
- Clients may bypass the clash guard by sending `"ignoreClash": true` in create or update payloads. The API responds with the conflicting shift meta to help the UI show a confirmation dialog.
- Weeks are Monday–Sunday blocks. Publishing a week locks every shift inside it:
  - Published weeks reject create/update/delete actions.
  - Publishing is only possible when the week has at least one shift.
  - Publishing writes `isPublished=true` and `publishedAt=timestamp` on the week row.
- Shifts may end after midnight provided the end time is still before the start time on the following day (< 24 hours duration). Attempts to create 24h shifts are rejected.

### 4.3 REST API Reference

Base path: `http://localhost:8000/v1`

| Method & Path                | Description                                                |
|-----------------------------|------------------------------------------------------------|
| `GET /shifts?weekStart=YYYY-MM-DD` | Returns `{ shifts, week }`. `weekStart` defaults to the current week if omitted. |
| `GET /shifts/{id}`          | Fetch a single shift (includes week metadata).             |
| `POST /shifts`              | Create a shift. Payload: `{ name, date, startTime, endTime, ignoreClash? }`. |
| `PATCH /shifts/{id}`        | Update fields on an existing shift. Accepts the same body schema as create. |
| `DELETE /shifts/{id}`       | Delete a shift (only when its week is not published).      |
| `POST /shifts/publish`      | Publish a week. Payload: `{ weekStart: "YYYY-MM-DD" }`.    |

#### Response Contracts

Every successful response matches:

```json
{
  "statusCode": 200,
  "message": "…",
  "results": …
}
```

Error responses include an optional `data` payload when clashes are detected, for example:

```json
{
  "statusCode": 409,
  "error": "HttpError",
  "message": "Shift clashes with an existing shift.",
  "data": {
    "conflictShift": {
      "id": "…",
      "name": "Morning Shift",
      "date": "2025-01-10",
      "startTime": "08:00:00",
      "endTime": "12:00:00"
    }
  }
}
```

### 4.4 Key Use Cases

- `src/usecases/shiftUsecase.ts` orchestrates all business logic (week creation, clash checks, publication rules, guard rails for cross-week edits, etc.).
- Repositories (`src/database/default/repository`) wrap TypeORM for consistent logging and reuse.
- Utility helpers (`src/shared/functions/date.ts`) centralise week calculations and date+time handling.

---

## 5. Frontend Technical Documentation

### 5.1 Technology Choices

- **React 19** with **TypeScript**
- **Material UI v6** for layout, typography, and inputs
- **Redux Toolkit** for global week/shift state (`src/store`)
- **React Hook Form + Joi** for form validation
- **Axios** for HTTP calls, automatically configured with the `.env` base URL

### 5.2 Core Features

- **Week picker**: arrow navigation plus an inline calendar popover keeps the selected Monday–Sunday window in sync with the URL (`?week=YYYY-MM-DD`) and Redux store.
- **Shift list**: table view that mirrors the provided mockups, including published week indicators and button states.
- **Shift form**: default values respect the active week and current hour, include clash handling via modal, and redirect back to the relevant week after submit.
- **Publish workflow**: single action to publish the visible week, with automatic UI locking and metadata highlight.
- **Clash handling**: backend errors are surfaced via a blocking dialog with “Cancel” and “Ignore” choices.

### 5.3 State Management Flow

1. `schedulerSlice` keeps the canonical selected week, shift list, and publication metadata.
2. The `Shift` page reacts to query-string changes, dispatching `fetchWeekData` to refresh data and update the store.
3. The `ShiftForm` reads the store (and query parameters) to default date pickers and to compute redirect targets post-submission.

### 5.4 Frontend Scripts

```bash
npm run start    # development server
npm run build    # production build
npm run test     # CRA test runner (optional)
```

---

## 6. Testing & Verification

While no automated tests were provided, the following manual flows were validated:

1. Create, update, delete shifts within unpublished weeks.
2. Detect overlapping shifts (including across midnight) and optionally ignore the warning.
3. Prevent edits/deletes once a week is published.
4. Block publishing empty weeks and disable UI controls accordingly.
5. Persist selected week in the URL to support browser navigation.

To run type checks/builds:

```bash
# Backend compilation
cd backend
npm run build

# Frontend compilation
cd ../frontend
npm run build
```

---

## 7. Notable Implementation Notes

- **Time arithmetic** uses shared helpers to avoid duplicated logic between create/update checks.
- **Week normalisation** ensures that all week references point to the Monday date, simplifying comparisons server-side and client-side.
- **Error handling**: the backend’s `HttpError` now supports structured `data`, enabling richer UX feedback (e.g. the clash dialog).
- **Accessibility & UX**: all buttons follow the design system colours, disabled states are explicit, and modal interactions match the mockups.

---

## 8. Troubleshooting

- Ensure PostgreSQL credentials match the `.env`; connection failures surface during server startup.
- When changing the API port, update both `backend/.env` and `frontend/.env`.
- If week selection behaves unexpectedly, clear the query string (`?week=`) and reload—Redux defaults to the current week automatically.

---

## 9. Future Improvements

- Add automated integration tests around clash detection and week publishing.
- Provide optimistic UI updates for publish/delete operations.
- Extend the API with filters (e.g. by staff member) and authentication.

Enjoy scheduling with StaffAny!
