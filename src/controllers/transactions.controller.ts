import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { writeTransaction } from "../services/transactions.service";
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
    const error: ErrorResponseDto = {
      statusCode: 500,
      name: "InternalServerError",
      message: "An unexpected error occurred while creating the transaction",
    };
    res.status(500).json(error);
  }
}
