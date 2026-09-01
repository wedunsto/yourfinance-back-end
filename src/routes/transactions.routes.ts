import { Router } from "express";
import { createTransaction } from "../controllers/transactions.controller";

export const transactionRouter = Router();

transactionRouter.post("/", createTransaction);
