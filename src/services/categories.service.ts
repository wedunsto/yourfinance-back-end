import { randomUUID } from "node:crypto";
import { Prisma, categories } from "@prisma/client";
import { prisma } from "./prisma.service";
import {
  CategoryDto,
  CreateCategoriesRequestDto,
  CreateCategoryRequestDto,
  DeleteCategoryResponseDto,
  UpdateCategoryRequestDto,
} from "../models/category.dto";

export class CategoryNotFoundError extends Error {
  constructor(category_id: string) {
    super(`No category exists with category_id: ${category_id}`);
    this.name = "CategoryNotFoundError";
  }
}

export class CategoryUserNotFoundError extends Error {
  constructor(user_id: string) {
    super(`No user exists with user_id: ${user_id}`);
    this.name = "CategoryUserNotFoundError";
  }
}

/**
 * Maps a categories database record to its response DTO.
 *
 * @param category - The category record returned by Prisma.
 * @returns The category with timestamps serialized as ISO strings.
 */
function toCategoryDto(category: categories): CategoryDto {
  return {
    id: category.id,
    user_id: category.user_id,
    name: category.name,
    severity: category.severity,
    created_at: category.created_at.toISOString(),
    updated_at: category.updated_at.toISOString(),
  };
}

/**
 * Reports whether an error is a Prisma "record not found" error.
 *
 * @param err - The error thrown by a Prisma call.
 * @returns True if the error has Prisma code P2025.
 */
function isRecordNotFound(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";
}

/**
 * Creates a category for a user.
 *
 * @param category - The user_id, name, and severity of the new category.
 * @returns The created category.
 * @throws {CategoryUserNotFoundError} If no user exists with the given user_id.
 */
export async function writeCategory(
  category: CreateCategoryRequestDto
): Promise<CategoryDto> {
  const now = new Date();

  try {
    const created = await prisma.categories.create({
      data: {
        id: randomUUID(),
        user_id: category.user_id,
        name: category.name,
        severity: category.severity,
        created_at: now,
        updated_at: now,
      },
    });

    return toCategoryDto(created);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      throw new CategoryUserNotFoundError(category.user_id);
    }
    throw err;
  }
}

/**
 * Creates several categories for a user in a single query, so either all of
 * them are created or none are.
 *
 * @param request - The user_id and the name/severity of each new category.
 * @returns The created categories.
 */
export async function writeCategories(
  request: CreateCategoriesRequestDto
): Promise<CategoryDto[]> {
  const now = new Date();

  const created = await prisma.categories.createManyAndReturn({
    data: request.categories.map((category) => ({
      id: randomUUID(),
      user_id: request.user_id,
      name: category.name,
      severity: category.severity,
      created_at: now,
      updated_at: now,
    })),
  });

  return created.map(toCategoryDto);
}

/**
 * Fetches every category belonging to a user.
 *
 * @param user_id - The id of the user whose categories to fetch.
 * @returns The user's categories (empty if they have none).
 */
export async function fetchCategories(user_id: string): Promise<CategoryDto[]> {
  const categories = await prisma.categories.findMany({
    where: { user_id },
  });

  return categories.map(toCategoryDto);
}

/**
 * Updates the name and/or severity of a category.
 *
 * @param category_id - The id of the category to update.
 * @param changes - The fields to change; omitted fields are left as-is.
 * @returns The updated category.
 * @throws {CategoryNotFoundError} If no category exists with the given id.
 */
export async function modifyCategory(
  category_id: string,
  changes: UpdateCategoryRequestDto
): Promise<CategoryDto> {
  try {
    const updated = await prisma.categories.update({
      where: { id: category_id },
      data: {
        name: changes.name,
        severity: changes.severity,
        updated_at: new Date(),
      },
    });

    return toCategoryDto(updated);
  } catch (err) {
    if (isRecordNotFound(err)) {
      throw new CategoryNotFoundError(category_id);
    }
    throw err;
  }
}

/**
 * Deletes a category record by its id.
 *
 * @param category_id - The id of the category to delete.
 * @returns The id of the deleted category.
 * @throws {CategoryNotFoundError} If no category exists with the given id.
 */
export async function deleteCategory(
  category_id: string
): Promise<DeleteCategoryResponseDto> {
  try {
    const deleted = await prisma.categories.delete({
      where: { id: category_id },
    });

    return { category_id: deleted.id };
  } catch (err) {
    if (isRecordNotFound(err)) {
      throw new CategoryNotFoundError(category_id);
    }
    throw err;
  }
}
