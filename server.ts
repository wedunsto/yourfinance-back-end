import "dotenv/config";
const express = require('express');
import { authenticationRouter } from "./src/routes/authentication.routes";

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

app.use(express.json());

app.use("/yourfinance", authenticationRouter);

app.listen(PORT, () => {
  console.log(`yourfinance-backend listening on port ${PORT}`);
});

module.exports = app;
