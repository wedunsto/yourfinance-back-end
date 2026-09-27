import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import {
  deleteTransaction,
  fetchTransactions,
  TransactionNotFoundError,
  writeTransaction,
} from "../services/transactions.service";
import { ErrorResponseDto } from "../models/error.dto";

function isMissing(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim().length === 0)
  );
}

function getBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }
  return header.slice("Bearer ".length).trim();
}

export async function createTransaction(req: Request, res: Response): Promise<void> {
  const token = getBearerToken(req);

  if (!token) {
    const error: ErrorResponseDto = {
      statusCode: 401,
      name: "Unauthorized",
      message: "Missing bearer token",
    };
    res.status(401).json(error);
    return;
  }

  try {
    jwt.verify(token, process.env["JWT_SECRET"] as string);
  } catch (err) {
    const error: ErrorResponseDto = {
      statusCode: 401,
      name: "Unauthorized",
      message: "Invalid or expired token",
    };
    res.status(401).json(error);
    return;
  }

  const {
    user_id,
    transaction_name,
    transaction_amount,
    category,
    vendor_name,
    credit,
  } = req.body ?? {};

  const requiredFields: Record<string, unknown> = {
    user_id,
    transaction_name,
    transaction_amount,
    category,
    vendor_name,
    credit,
  };

  const missingFields = Object.entries(requiredFields)
    .filter(([, value]) => isMissing(value))
    .map(([key]) => key);

  if (missingFields.length > 0) {
    const error: ErrorResponseDto = {
      statusCode: 400,
      name: "BadRequest",
      message: `Missing required field(s): ${missingFields.join(", ")}`,
    };
    res.status(400).json(error);
    return;
  }

  if (typeof credit !== "boolean" || typeof transaction_amount !== "number") {
    const error: ErrorResponseDto = {
      statusCode: 400,
      name: "BadRequest",
      message: "credit must be a boolean and transaction_amount must be a number",
    };
    res.status(400).json(error);
    return;
  }

  try {
    const result = await writeTransaction({
      user_id,
      transaction_name,
      transaction_amount,
      category,
      vendor_name,
      credit,
    });
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      const error: ErrorResponseDto = {
        statusCode: 400,
        name: "BadRequest",
        message: `No user exists with user_id: ${user_id}`,
      };
      res.status(400).json(error);
      return;
    }

    console.error("Failed to create transaction:", err);
    const error: ErrorResponseDto = {
      statusCode: 500,
      name: "InternalServerError",
      message: "An unexpected error occurred while creating the transaction",
    };
    res.status(500).json(error);
  }
}

export async function readTransctions(req: Request, res: Response): Promise<void> {
  const token = getBearerToken(req);

  if (!token) {
    const error: ErrorResponseDto = {
      statusCode: 401,
      name: "Unauthorized",
      message: "Missing bearer token",
    };
    res.status(401).json(error);
    return;
  }

  try {
    jwt.verify(token, process.env["JWT_SECRET"] as string);
  } catch (err) {
    const error: ErrorResponseDto = {
      statusCode: 401,
      name: "Unauthorized",
      message: "Invalid or expired token",
    };
    res.status(401).json(error);
    return;
  }

  const { user_id } = req.query;

  if (isMissing(user_id)) {
    const error: ErrorResponseDto = {
      statusCode: 400,
      name: "BadRequest",
      message: "Missing required field(s): user_id",
    };
    res.status(400).json(error);
    return;
  }

  try {
    const result = await fetchTransactions(user_id as string);
    res.status(201).json(result);
  } catch (err) {
    const error: ErrorResponseDto = {
      statusCode: 500,
      name: "InternalServerError",
      message: "An unexpected error occurred while fetching transactions",
    };
    res.status(500).json(error);
  }
}

/**
 * Handles DELETE /:transaction_id — verifies the bearer token, then deletes
 * the transaction identified by the `transaction_id` route parameter.
 *
 * Responds 200 with the deleted transaction_id, 400 if the id is missing,
 * 401 for a missing/invalid token, 404 if the transaction doesn't exist,
 * and 500 for unexpected errors.
 */
export async function removeTransaction(req: Request, res: Response): Promise<void> {
  const token = getBearerToken(req);

  if (!token) {
    const error: ErrorResponseDto = {
      statusCode: 401,
      name: "Unauthorized",
      message: "Missing bearer token",
    };
    res.status(401).json(error);
    return;
  }

  try {
    jwt.verify(token, process.env["JWT_SECRET"] as string);
  } catch (err) {
    const error: ErrorResponseDto = {
      statusCode: 401,
      name: "Unauthorized",
      message: "Invalid or expired token",
    };
    res.status(401).json(error);
    return;
  }

  const { transaction_id } = req.params;

  if (isMissing(transaction_id)) {
    const error: ErrorResponseDto = {
      statusCode: 400,
      name: "BadRequest",
      message: "Missing required field(s): transaction_id",
    };
    res.status(400).json(error);
    return;
  }

  try {
    const result = await deleteTransaction(transaction_id as string);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof TransactionNotFoundError) {
      const error: ErrorResponseDto = {
        statusCode: 404,
        name: "NotFound",
        message: err.message,
      };
      res.status(404).json(error);
      return;
    }

    console.error("Failed to delete transaction:", err);
    const error: ErrorResponseDto = {
      statusCode: 500,
      name: "InternalServerError",
      message: "An unexpected error occurred while deleting the transaction",
    };
    res.status(500).json(error);
  }
}
