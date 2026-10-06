import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  CategoryNotFoundError,
  CategoryUserNotFoundError,
  deleteCategory,
  fetchCategories,
  modifyCategory,
  writeCategories,
  writeCategory,
} from "../services/categories.service";
import { ErrorResponseDto } from "../models/error.dto";

/**
 * Reports whether a request value is absent or an empty/whitespace string.
 *
 * @param value - The value to check.
 * @returns True if the value is undefined, null, or a blank string.
 */
function isMissing(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim().length === 0)
  );
}

/**
 * Builds an ErrorResponseDto.
 *
 * @param statusCode - The HTTP status code.
 * @param name - The error name.
 * @param message - A human-readable description of the error.
 * @returns The error response body.
 */
function buildError(statusCode: number, name: string, message: string): ErrorResponseDto {
  return { statusCode, name, message };
}

/**
 * Checks the request's `Authorization: Bearer <token>` header against JWT_SECRET.
 *
 * @param req - The incoming request.
 * @returns A 401 ErrorResponseDto if the token is missing or invalid, otherwise null.
 */
function getAuthorizationError(req: Request): ErrorResponseDto | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return buildError(401, "Unauthorized", "Missing bearer token");
  }

  try {
    jwt.verify(header.slice("Bearer ".length).trim(), process.env["JWT_SECRET"] as string);
    return null;
  } catch {
    return buildError(401, "Unauthorized", "Invalid or expired token");
  }
}

/**
 * Reports whether a value is a valid category name.
 *
 * @param value - The value to check.
 * @returns True if the value is a non-blank string.
 */
function isValidName(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Reports whether a value is a valid category severity.
 *
 * @param value - The value to check.
 * @returns True if the value is an integer.
 */
function isValidSeverity(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value);
}

/**
 * Handles POST / — verifies the bearer token, then creates a category from
 * `user_id`, `name`, and `severity` in the request body.
 *
 * Responds 201 with the created category, 400 for missing/invalid fields or
 * an unknown user_id, 401 for a missing/invalid token, and 500 for unexpected errors.
 */
export async function createCategory(req: Request, res: Response): Promise<void> {
  const authError = getAuthorizationError(req);
  if (authError) {
    res.status(401).json(authError);
    return;
  }

  const { user_id, name, severity } = req.body ?? {};

  const missingFields = Object.entries({ user_id, name, severity })
    .filter(([, value]) => isMissing(value))
    .map(([key]) => key);

  if (missingFields.length > 0) {
    res
      .status(400)
      .json(buildError(400, "BadRequest", `Missing required field(s): ${missingFields.join(", ")}`));
    return;
  }

  if (!isValidName(name) || !isValidSeverity(severity)) {
    res
      .status(400)
      .json(buildError(400, "BadRequest", "name must be a string and severity must be an integer"));
    return;
  }

  try {
    const result = await writeCategory({ user_id, name: name.trim(), severity });
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof CategoryUserNotFoundError) {
      res.status(400).json(buildError(400, "BadRequest", err.message));
      return;
    }

    console.error("Failed to create category:", err);
    res
      .status(500)
      .json(buildError(500, "InternalServerError", "An unexpected error occurred while creating the category"));
  }
}

/**
 * Finds the positions of category items that lack a valid name or severity.
 *
 * @param items - The category items from the request body.
 * @returns The zero-based indexes of the invalid items (empty if all are valid).
 */
function findInvalidCategoryIndexes(items: unknown[]): number[] {
  return items
    .map((item, index) => {
      const { name, severity } = (item ?? {}) as Record<string, unknown>;
      return isValidName(name) && isValidSeverity(severity) ? -1 : index;
    })
    .filter((index) => index !== -1);
}

/**
 * Handles POST /multiple — verifies the bearer token, then creates every
 * category in the `categories` array of the request body for `user_id`.
 * All categories are created together, or none are.
 *
 * Responds 201 with the created categories, 400 if user_id is missing,
 * categories is not a non-empty array, or any item has an invalid name or
 * severity, 401 for a missing/invalid token, and 500 for unexpected errors.
 */
export async function createCategories(req: Request, res: Response): Promise<void> {
  const authError = getAuthorizationError(req);
  if (authError) {
    res.status(401).json(authError);
    return;
  }

  const {categoriesAndSeverities } = req.body ?? {};

  console.log(categoriesAndSeverities)

  if (isMissing(categoriesAndSeverities[0].user_id) || typeof categoriesAndSeverities[0].user_id !== "string") {
    res.status(400).json(buildError(400, "BadRequest", "Missing required field(s): user_id"));
    return;
  }

  if (!Array.isArray(categoriesAndSeverities) || categoriesAndSeverities.length === 0) {
    res
      .status(400)
      .json(buildError(400, "BadRequest", "categories must be a non-empty array"));
    return;
  }

  const invalidIndexes = findInvalidCategoryIndexes(categoriesAndSeverities);
  if (invalidIndexes.length > 0) {
    res
      .status(400)
      .json(
        buildError(
          400,
          "BadRequest",
          `Each category needs a non-empty string name and an integer severity. Invalid item(s) at index: ${invalidIndexes.join(", ")}`
        )
      );
    return;
  }

  try {
    const result = await writeCategories({
      user_id: categoriesAndSeverities[0].user_id,
      categories: categoriesAndSeverities.map(({ name, severity }: { name: string; severity: number }) => ({
        name: name.trim(),
        severity,
      })),
    });
    res.status(201).json(result);
  } catch (err) {
    console.error("Failed to create categories:", err);
    res
      .status(500)
      .json(buildError(500, "InternalServerError", "An unexpected error occurred while creating the categories"));
  }
}

/**
 * Handles GET /?user_id= — verifies the bearer token, then returns every
 * category belonging to the given user.
 *
 * Responds 200 with the categories, 400 if user_id is missing,
 * 401 for a missing/invalid token, and 500 for unexpected errors.
 */
export async function readCategories(req: Request, res: Response): Promise<void> {
  const authError = getAuthorizationError(req);
  if (authError) {
    res.status(401).json(authError);
    return;
  }

  const { user_id } = req.query;

  if (isMissing(user_id) || typeof user_id !== "string") {
    res.status(400).json(buildError(400, "BadRequest", "Missing required field(s): user_id"));
    return;
  }

  try {
    const result = await fetchCategories(user_id);
    res.status(200).json(result);
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    res
      .status(500)
      .json(buildError(500, "InternalServerError", "An unexpected error occurred while fetching categories"));
  }
}

/**
 * Handles PUT /:category_id — verifies the bearer token, then updates the
 * category's `name` and/or `severity` from the request body.
 *
 * Responds 200 with the updated category, 400 if neither field is provided or
 * either is invalid, 401 for a missing/invalid token, 404 if the category
 * doesn't exist, and 500 for unexpected errors.
 */
export async function updateCategory(req: Request, res: Response): Promise<void> {
  const authError = getAuthorizationError(req);
  if (authError) {
    res.status(401).json(authError);
    return;
  }

  const { category_id } = req.params;
  const { name, severity } = req.body ?? {};

  if (name === undefined && severity === undefined) {
    res
      .status(400)
      .json(buildError(400, "BadRequest", "Provide at least one field to update: name, severity"));
    return;
  }

  if ((name !== undefined && !isValidName(name)) || (severity !== undefined && !isValidSeverity(severity))) {
    res
      .status(400)
      .json(buildError(400, "BadRequest", "name must be a non-empty string and severity must be an integer"));
    return;
  }

  try {
    const result = await modifyCategory(category_id as string, {
      name: name?.trim(),
      severity,
    });
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof CategoryNotFoundError) {
      res.status(404).json(buildError(404, "NotFound", err.message));
      return;
    }

    console.error("Failed to update category:", err);
    res
      .status(500)
      .json(buildError(500, "InternalServerError", "An unexpected error occurred while updating the category"));
  }
}

/**
 * Handles DELETE /:category_id — verifies the bearer token, then deletes
 * the category identified by the `category_id` route parameter.
 *
 * Responds 200 with the deleted category_id, 401 for a missing/invalid token,
 * 404 if the category doesn't exist, and 500 for unexpected errors.
 */
export async function removeCategory(req: Request, res: Response): Promise<void> {
  const authError = getAuthorizationError(req);
  if (authError) {
    res.status(401).json(authError);
    return;
  }

  const { category_id } = req.params;

  try {
    const result = await deleteCategory(category_id as string);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof CategoryNotFoundError) {
      res.status(404).json(buildError(404, "NotFound", err.message));
      return;
    }

    console.error("Failed to delete category:", err);
    res
      .status(500)
      .json(buildError(500, "InternalServerError", "An unexpected error occurred while deleting the category"));
  }
}
