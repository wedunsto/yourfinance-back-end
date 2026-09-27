import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma.service";
import {
  CreateTransactionRequestDto,
  DeleteTransactionResponseDto,
  TransactionDto,
} from "../models/transaction.dto";

export class TransactionNotFoundError extends Error {
  constructor(transaction_id: string) {
    super(`No transaction exists with transaction_id: ${transaction_id}`);
    this.name = "TransactionNotFoundError";
  }
}

export async function fetchTransactions(user_id: string): Promise<TransactionDto[]> {
  const transactions = await prisma.transactions.findMany({
    where: { user_id },
  });

  return transactions.map((transaction) => ({
    id: transaction.id,
    user_id: transaction.user_id,
    transaction_name: transaction.transaction_name,
    transaction_amount: transaction.transaction_amount.toNumber(),
    transaction_date: transaction.transaction_date.toISOString(),
    category: transaction.category,
    vendor_name: transaction.vendor_name,
    credit: transaction.credit,
    updated_at: transaction.updated_at.toISOString(),
  }));
}

export async function writeTransaction(
  transaction: CreateTransactionRequestDto
): Promise<TransactionDto> {
  const created = await prisma.transactions.create({
    data: {
      id: randomUUID(),
      user_id: transaction.user_id,
      transaction_name: transaction.transaction_name,
      transaction_amount: transaction.transaction_amount,
      transaction_date: new Date(),
      category: transaction.category,
      vendor_name: transaction.vendor_name,
      credit: transaction.credit,
      updated_at: new Date()
    },
  });

  return {
    id: created.id,
    user_id: created.user_id,
    transaction_name: created.transaction_name,
    transaction_amount: created.transaction_amount.toNumber(),
    transaction_date: created.transaction_date.toISOString(),
    category: created.category,
    vendor_name: created.vendor_name,
    credit: created.credit,
    updated_at: created.updated_at.toISOString(),
  };
}

/**
 * Deletes a transaction record by its id.
 *
 * @param transaction_id - The id of the transaction to delete.
 * @returns The id of the deleted transaction.
 * @throws {TransactionNotFoundError} If no transaction exists with the given id.
 */
export async function deleteTransaction(
  transaction_id: string
): Promise<DeleteTransactionResponseDto> {
  try {
    const deleted = await prisma.transactions.delete({
      where: { id: transaction_id },
    });

    return { transaction_id: deleted.id };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      throw new TransactionNotFoundError(transaction_id);
    }
    throw err;
  }
}
