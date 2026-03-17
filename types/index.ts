export interface User {
  id: string;
  email: string;
  handle: string;
  name?: string | null;
  avatar?: string | null;
  isVerified: boolean;
  createdAt: Date;
}

export interface IncomePool {
  id: string;
  userId: string;
  name: string;
  percentage: number;
  bankAccountToken?: string | null;
  bankLastFour?: string | null;
  bankName?: string | null;
  isActive: boolean;
  order: number;
  color: string;
}

export interface Transaction {
  id: string;
  userId: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed";
  description?: string | null;
  customerEmail?: string | null;
  paymentRef?: string | null;
  createdAt: Date;
  splits?: TransactionSplit[];
}

export interface TransactionSplit {
  id: string;
  transactionId: string;
  poolId: string;
  amount: number;
  payoutRef?: string | null;
  status: string;
  pool?: IncomePool;
}

export interface PaymentLink {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  amount?: number | null;
  isFlexible: boolean;
  isActive: boolean;
  slug: string;
  views: number;
}
