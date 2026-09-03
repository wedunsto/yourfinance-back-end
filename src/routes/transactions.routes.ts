import { Router } from "express";
import { createTransaction, readTransctions } from "../controllers/transactions.controller";

export const transactionRouter = Router();

transactionRouter.post("/", createTransaction);
transactionRouter.get("/", readTransctions);
