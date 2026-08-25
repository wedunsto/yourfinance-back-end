import { Request, Response } from "express";
import { registerUser } from "../services/authentication.service";
import { ErrorResponseDto } from "../models/error.dto";

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

function isMissing(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim().length === 0)
  );
}

export async function register(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body ?? {};

  if (isMissing(username) || isMissing(password)) {
    const missingFields = [
      isMissing(username) ? "username" : null,
      isMissing(password) ? "password" : null,
    ].filter(Boolean);

    const error: ErrorResponseDto = {
      statusCode: 400,
      name: "BadRequest",
      message: `Missing required field(s): ${missingFields.join(", ")}`,
    };
    res.status(400).json(error);
    return;
  }

  if (!PASSWORD_REGEX.test(password)) {
    const error: ErrorResponseDto = {
      statusCode: 400,
      name: "BadRequest",
      message:
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character",
    };
    res.status(400).json(error);
    return;
  }

  try {
    const result = await registerUser(username, password);
    res.status(201).json(result);
  } catch (err) {
    const error: ErrorResponseDto = {
      statusCode: 500,
      name: "InternalServerError",
      message: "An unexpected error occurred while registering the user",
    };
    res.status(500).json(error);
  }
}
