---
name: read-transactions
description: Scaffolds getting existing transactions flow for the YourFinance backend: request/response DTOs, error DTO, the `fetchTransactions` service reads the transaction records from the transaction table, the `readTransactions` controller function that requires a bearer token then calls `fetchTransactions`, and wiring it into `transactionRouter`.
---

## Stack conventions
- Node.js / Express backend
- Prisma as the only data-access layer — no raw SQL
- Layering: route → controller → service (service holds the Prisma call, controller handles req/res, route wires the path)

---

# Read Transactions

Scaffolds the full read transactions flow for the YourFinance Node.js/Express backend: DTOs, service, controller function updates, and router updates.

## Files to update

### 1. `src/services/transactions.service.ts`

- **`fetchTransactions(user_id: String): Promise<TransactionDto[]>`**
    - Accepts a user id as an input.
    - On success, uses prisma to read the transaction records from the transactions database table. Returns a `TransactionDto` array.
    - On failure, throws so the controller can catch it and map it to an `ErrorResponseDto` (see the controller table below) — `fetchTransactions` does not decide HTTP status codes or send responses itself.

### 2. `src/routes/transactions.controller.ts`

- **`readTransctions(req, res)`**
    
    - Extracts `user_id` from `req.query`.
    - Calls `fetchTransactions` and is responsible for sending the actual HTTP response (`res.status(...).json(...)`) — `fetchTransactions` only returns data or throws.
    
    Response logic:
    
    |Condition|Status|Response body|
    |---|---|---|
    |`user_id` missing or empty |400|`ErrorResponseDto` — statusCode 400, name `"BadRequest"`, message identifying the missing field(s)|
    |`fetchTransactions` throws / unexpected error|500|`ErrorResponseDto` — statusCode 500, name `"InternalServerError"`, generic message|
    |`fetchTransactions` succeeds|201|`TransactionDto[]` — the fetched transaction|
    
    "Missing or empty" means `undefined`, `null`, or an empty/whitespace-only string.
    

### 3. `src/routes/authentication.routes.ts`

- **`transactionRouter`** (Express `Router`)
    - `GET /yourfinance/transactions` → calls `readTransctions` from `src/routes/transactions.controller.ts`.

### 6. `server.ts`

- Mount `transactionRouter` on the app under the `/yourfinance` base path, e.g.:
    
    ```ts
    app.use("/yourfinance/transactions", transactionRouter);
    ```