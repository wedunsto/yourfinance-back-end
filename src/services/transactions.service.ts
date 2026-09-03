import { randomUUID } from "node:crypto";
import { prisma } from "./prisma.service";
import { CreateTransactionRequestDto, TransactionDto } from "../models/transaction.dto";

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
