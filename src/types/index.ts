// types/index.ts
import { ObjectId } from "mongodb";

// লেনদেনের ধরন
export type TransactionType = "income" | "expense";

// ইউনিটের ধরন
export type UnitType =
  | "kg"
  | "gm"
  | "ml"
  | "l"
  | "ps"
  | "pcs"
  | "packet"
  | "dozen"
  | "meter"
  | "bundle";

// ক্যাটাগরি ইন্টারফেস
export interface ICategory {
  _id?: string | ObjectId;
  userId: string; // কোন ইউজারের ক্যাটাগরি
  name: string; // ক্যাটাগরির নাম
  icon: string; // react-icons এর নাম (যেমন: "FaPills")
  isDefault: boolean; // ডিফল্ট ক্যাটাগরি কি না
  createdAt: Date;
}

// লেনদেন ইন্টারফেস
export interface ITransaction {
  _id?: string | ObjectId;
  userId: string; // কোন ইউজারের লেনদেন
  date: Date; // তারিখ
  item: string; // আইটেমের নাম (অবশ্যই লাগবে)
  quantity?: number; // পরিমাণ (অপশনাল)
  unit?: UnitType; // একক (kg, ml, ps ইত্যাদি)
  price: number; // মূল্য
  categoryId: string; // ক্যাটাগরির রেফারেন্স
  categoryName?: string; // ডেনরমালাইজড নাম (দ্রুত ফেচের জন্য)
  categoryIcon?: string; // ডেনরমালাইজড আইকন
  type: TransactionType; // আয় বা ব্যয়
  note?: string; // অতিরিক্ত নোট
  createdAt: Date;
  updatedAt: Date;
}

// ড্যাশবোর্ড স্ট্যাটস
export interface IDashboardStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}
