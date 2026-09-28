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

export interface IPeriod {
  _id?: string | ObjectId;
  userId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
}

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
  periodId?: string | null;
  periodName?: string | null;
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
  currentPeriodExpense: number;
  transactionCount: number;
}

export interface IPeriodSummary {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  total: number;
  count: number;
}

export interface IDailyReport {
  date: string;
  label: string;
  total: number;
  count: number;
}
