import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  usernameExists,
  UsernameTakenError,
} from "../services/authentication.service";
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
    if (err instanceof UsernameTakenError) {
      const error: ErrorResponseDto = {
        statusCode: 409,
        name: "Conflict",
        message: err.message,
      };
      res.status(409).json(error);
      return;
    }

    const error: ErrorResponseDto = {
      statusCode: 500,
      name: "InternalServerError",
      message: "An unexpected error occurred while registering the user",
    };
    res.status(500).json(error);
  }
}

export async function checkUsernameExists(req: Request, res: Response): Promise<void> {
  const { username } = req.query ?? {};

  if (isMissing(username)) {
    const error: ErrorResponseDto = {
      statusCode: 400,
      name: "BadRequest",
      message: "Missing required field(s): username",
    };
    res.status(400).json(error);
    return;
  }

  try {
    const exists = await usernameExists(username as string);
    res.status(200).json({ exists });
  } catch (err) {
    const error: ErrorResponseDto = {
      statusCode: 500,
      name: "InternalServerError",
      message: "An unexpected error occurred while checking the username",
    };
    res.status(500).json(error);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { username, password } = req.body ?? {};

  if (isMissing(username) || isMissing(password) || !PASSWORD_REGEX.test(password)) {
    const missingFields = [
      isMissing(username) ? "username" : null,
      isMissing(password) ? "password" : null,
    ].filter(Boolean);

    const error: ErrorResponseDto = {
      statusCode: 400,
      name: "BadRequest",
      message: missingFields.length
        ? `Missing required field(s): ${missingFields.join(", ")}`
        : "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character",
    };
    res.status(400).json(error);
    return;
  }

  try {
    const result = await loginUser(username, password);
    res.status(200).json(result);
  } catch (err) {
    const error: ErrorResponseDto = {
      statusCode: 500,
      name: "InternalServerError",
      message: "An unexpected error occurred while logging in",
    };
    res.status(500).json(error);
  }
}
