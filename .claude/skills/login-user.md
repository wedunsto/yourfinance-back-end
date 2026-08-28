---
name: login-user
description: Scaffolds an existing user login flow for the YourFinance backend: request/response DTOs, error DTO, the `loginUser` service that leverages jsonwebtoken to provide successfully authenticated users with a json web token, the `login` controller function, and wiring it into `authenticationRouter`. Use this whenever the user asks to add user login, login, or account authentication to the backend
---

## Stack conventions
- Node.js / Express backend
- Prisma as the only data-access layer — no raw SQL
- Layering: route → controller → service (service holds the Prisma call, controller handles req/res, route wires the path)

---

# Login User

Scaffolds the full login flow for the YourFinance Node.js/Express backend: DTOs, service, controller, and router, then wires the router into `server.ts`.

## Files to create

Two DTOs:

- **`LoginRequestDto`** — describes the login request payload.
    - `username: string`
    - `password: string`
- **`LoginResponseDto`** — describes the login response payload.
    - `jsonwebtoken: string`

### 2. `src/services/authentication.service.ts`

- **`loginUser(username: string, password: string): Promise<LoginResponseDto>`**
    - Accepts a username and password (matching the shape of `LoginRequestDto`)
    - Confirm a record with the given username exists in the database
    - Validate the password against the hashed password
    - On success, returns a `LoginResponseDto` containing the jsonwebtoken
    - On failure, throws so the controller can catch it and map it to an `ErrorResponseDto` (see the controller table below) — `loginUser` does not decide HTTP status codes or send responses itself.

### 3. `src/routes/authentication.controller.ts`

- **`login(req, res)`**
    
    - Extracts `username` and `password` from `req.body`.
    - Calls `loginUser` and is responsible for sending the actual HTTP response (`res.status(...).json(...)`) — `loginUser` only returns data or throws.
    
    Response logic:
    
    |Condition|Status|Response body|
    |---|---|---|
    |`username` or `password` missing or empty or password fails regualar expression |400|`ErrorResponseDto` — statusCode 400, name `"BadRequest"`, message identifying the missing field(s)|
    |`loginUser` throws / unexpected error|500|`ErrorResponseDto` — statusCode 500, name `"InternalServerError"`, generic message|
    |`loginUser` succeeds|200|`loginResponseDto` — the created jsonwebtoken|
    
    "Missing or empty" means `undefined`, `null`, or an empty/whitespace-only string.
    

### 4. `src/routes/authentication.routes.ts`

- **`authenticationRouter`** (Express `Router`)
    - `GET /user` → calls `login` from `src/routes/authentication.controller.ts`.