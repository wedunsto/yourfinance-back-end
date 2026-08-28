---
name: register-user
description: Scaffolds a new-user registration flow for the YourFinance backend: request/response DTOs, error DTO, the `registerUser` service with bcrypt password hashing, the `register` controller, and wiring it into `authenticationRouter`. Use this whenever the user asks to add user registration, sign-up, or account creation to the backend
---

## Stack conventions
- Node.js / Express backend
- Layering: route → controller → service (service holds the Prisma call, controller handles req/res, route wires the path)

---

# Register User

Scaffolds the full registration flow for the YourFinance Node.js/Express backend: DTOs, service, controller, and router, then wires the router into `server.ts`.

## Files to create

### 1. `src/models/authentication.dto.ts`

Two DTOs:

- **`RegisterRequestDto`** — describes the registration request payload.
    - `username: string`
    - `password: string`
- **`RegisterResponseDto`** — describes the registration response payload.
    - `username: string`

### 2. `src/models/error.dto.ts`

- **`ErrorResponseDto`** — describes error responses.
    - `statusCode: number`
    - `name: string`
    - `message: string`

Use consistent values for `name` across error paths:

- `"BadRequest"` for validation failures (400)
- `"InternalServerError"` for unexpected failures (500)

### 3. `src/services/authentication.service.ts`

- **`registerUser(username: string, password: string): Promise<RegisterResponseDto>`**
    - Accepts a username and password (matching the shape of `RegisterRequestDto`).
    - Hashes the password with `bcrypt` before persisting/using it.
    - On success, returns a `RegisterResponseDto` containing the username.
    - On failure, throws so the controller can catch it and map it to an `ErrorResponseDto` (see the controller table below) — `registerUser` does not decide HTTP status codes or send responses itself.

### 4. `src/routes/authentication.controller.ts`

- **`register(req, res)`**
    
    - Extracts `username` and `password` from `req.body`.
    - Password must follow this regular expression ^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$
    - Calls `registerUser` and is responsible for sending the actual HTTP response (`res.status(...).json(...)`) — `registerUser` only returns data or throws.
    
    Response logic:
    
    |Condition|Status|Response body|
    |---|---|---|
    |`username` or `password` missing or empty or password fails regualar expression |400|`ErrorResponseDto` — statusCode 400, name `"BadRequest"`, message identifying the missing field(s)|
    |`registerUser` throws / unexpected error|500|`ErrorResponseDto` — statusCode 500, name `"InternalServerError"`, generic message|
    |`registerUser` succeeds|201|`RegisterResponseDto` — the created username|
    
    "Missing or empty" means `undefined`, `null`, or an empty/whitespace-only string.
    

### 5. `src/routes/authentication.routes.ts`

- **`authenticationRouter`** (Express `Router`)
    - `POST /user` → calls `register` from `src/routes/authentication.controller.ts`.

### 6. `server.ts`

- Mount `authenticationRouter` on the app under the `/yourfinance` base path, e.g.:
    
    ```ts
    app.use("/yourfinance", authenticationRouter);
    ```
    