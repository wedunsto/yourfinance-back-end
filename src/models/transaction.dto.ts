export interface TransactionDto {
  id: string;
  user_id: string;
  transaction_name: string;
  transaction_amount: number;
  transaction_date: string;
  category: string;
  vendor_name: string;
  credit: boolean;
  updated_at: string;
}

export interface CreateTransactionRequestDto {
  user_id: string;
  transaction_name: string;
  transaction_amount: number;
  category: string;
  vendor_name: string;
  credit: boolean;
}
