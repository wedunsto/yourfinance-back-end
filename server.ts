import "dotenv/config";
import cors from "cors";
const express = require('express');
import { allowedOrigins } from "./src/middleware/cors.middleware";
import { authenticationRouter } from "./src/routes/authentication.routes";
import { transactionRouter } from "./src/routes/transactions.routes";

const app = express();
const PORT = process.env.SERVER_PORT;

app.use(express.json());

// Tell the browser which origins are permitted
app.use(cors({
    origin: allowedOrigins, credentials: true
}));

app.use("/yourfinance/user", authenticationRouter);
app.use("/yourfinance/transactions", transactionRouter);

app.listen(PORT, () => {
  console.log(`yourfinance-backend is running`);
});

module.exports = app;
