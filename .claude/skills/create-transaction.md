---
name: create-transaction
description: Scaffolds a new transaction flow for the YourFinance backend: request/response DTOs, error DTO, the `writeTransaction` service that writes the transaction record on the transaction table, the `transactions` controller, and wiring it into `transactionRouter`. Uses the `transactionRouter` in `server.ts`. Use this whenever the user asks to create a transaction service, controller, router.
---

## Stack conventions
- Node.js / Express backend
- Prisma as the only data-access layer — no raw SQL
- Layering: route → controller → service (service holds the Prisma call, controller handles req/res, route wires the path)

---

# Create Transaction

Scaffolds the full create transaction flow for the YourFinance Node.js/Express backend: DTOs, service, controller, and router, then wires the router into `server.ts`.

## Files to create

### 1. `src/models/transaction.dto.ts`

- **`TransactionDto`** — describes the transaction request payload.
    - `id: string`
    - `user_id: string`
    - `transaction_name: string`
    - `transaction_amount: decimal`
    - `transaction_date: timestamp`
    - `category: string`
    - `vendor_name: string`
    - `credit: boolean`
    - `updated_date: timestamp`

Use consistent values for `name` across error paths:

- `"BadRequest"` for validation failures (400)
- `"InternalServerError"` for unexpected failures (500)

### 3. `src/services/transactions.service.ts`

- **`writeTransaction(transaction: TransactionDto): Promise<TransactionDto>`**
    - Accepts a transaction record (matching the shape of `TransactionDto`).
    - On success, uses prisma to write the transaction record to the transactions database table with an id, created_at and updated_at field, returns a `TransactionDto` containing the transaction details for the front-end to store in the NgRx store.
    - On failure, throws so the controller can catch it and map it to an `ErrorResponseDto` (see the controller table below) — `writeTransaction` does not decide HTTP status codes or send responses itself.

### 4. `src/routes/transactions.controller.ts`

- **`createTransction(req, res)`**
    
    - Extracts `user_id`, `transaction_name`, `transaction_amount`, `transaction_date`, `category`, `vendor_name`, and `credit` from `req.body`.
    - Calls `writeTransaction` and is responsible for sending the actual HTTP response (`res.status(...).json(...)`) — `writeTransaction` only returns data or throws.
    
    Response logic:
    
    |Condition|Status|Response body|
    |---|---|---|
    |`user_id`, `transaction_name`, `transaction_amount`, `transaction_date`, `category`, `vendor_name`, or `credit` missing or empty |400|`ErrorResponseDto` — statusCode 400, name `"BadRequest"`, message identifying the missing field(s)|
    |`writeTransaction` throws / unexpected error|500|`ErrorResponseDto` — statusCode 500, name `"InternalServerError"`, generic message|
    |`writeTransaction` succeeds|201|`TransactionDto` — the created transaction|
    
    "Missing or empty" means `undefined`, `null`, or an empty/whitespace-only string.
    

### 5. `src/routes/authentication.routes.ts`

- **`transactionRouter`** (Express `Router`)
    - `POST /yourfinance/transaction` → calls `createTransction` from `src/routes/transactions.controller.ts`.

### 6. `server.ts`

- Mount `transactionRouter` on the app under the `/yourfinance` base path, e.g.:
    
    ```ts
    app.use("/yourfinance/transaction", transactionRouter);
    ```