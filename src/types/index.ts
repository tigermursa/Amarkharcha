// types/index.ts
import { ObjectId } from "mongodb";

export type UnitType =
  | "kg"
  | "g"
  | "ml"
  | "l"
  | "pcs"
  | "packet"
  | "dozen"
  | "meter"
  | "bundle";

export interface ICategory {
  _id?: string | ObjectId;
  userId: string;
  name: string;
  icon: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface ITransaction {
  _id?: string | ObjectId;
  userId: string;
  date: Date;
  item: string;
  quantity?: number | null;
  unit?: UnitType | null;
  price: number;
  categoryId: string;
  categoryName?: string;
  categoryIcon?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDashboardStats {
  totalExpense: number;
  todayExpense: number;
  monthExpense: number;
  transactionCount: number;
}

// 🆕 Reports
export interface IMonthlyReport {
  month: string; // "2025-01"
  label: string; // "Jan 2025"
  total: number;
  count: number;
}

export interface IDailyReport {
  date: string; // "2025-01-15"
  label: string; // "15 Jan"
  total: number;
  count: number;
}
