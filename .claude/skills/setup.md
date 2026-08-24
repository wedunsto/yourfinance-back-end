name: setup-yourfinance-backend
description: Create the Node.js project and call it yourfinance-backend. Install Express for simplified routing and request handling. Install nodemon so we can have live updates and reload the back-end when the code changes. Install jsonwebtoken so we can provide authorization to back-end requests. Install bcrypt so we can hash and salt registered passwords before storing them in the database

## Stack conventions
- Node.js / Express backend
- Layering: route → controller → service (service holds the Prisma call, controller handles req/res, route wires the path)
  
## Process
1. Create the Node.js project and call it yourfinance-backend
2. Run `npm install express` to install the Express package
3. Run `npm install --save-dev nodemon` to install the nodemon package
4. Run `npm install jsonwebtoken` to install the jsonwebtoken package
5. Run `npm install -D @types/jsonwebtoken`
6. Run `npm install bcrypt` to install the bcrypt package
7. Run `npm install -D @types/bcrypt`