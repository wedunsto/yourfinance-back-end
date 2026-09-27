import { Router } from "express";
import {
  createTransaction,
  readTransctions,
  removeTransaction,
} from "../controllers/transactions.controller";

export const transactionRouter = Router();

transactionRouter.post("/", createTransaction);
transactionRouter.get("/", readTransctions);
transactionRouter.delete("/:transaction_id", removeTransaction);
