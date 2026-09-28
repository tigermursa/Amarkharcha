// lib/default-categories.ts
import { ICategory } from "@/types";

export const DEFAULT_CATEGORIES: Omit<
  ICategory,
  "_id" | "createdAt" | "userId"
>[] = [
  { name: "Medicine", icon: "FaPills", isDefault: true },
  { name: "Grocery", icon: "FaShoppingBasket", isDefault: true },
  { name: "Vegetables", icon: "FaCarrot", isDefault: true },
  { name: "Snacks", icon: "FaHamburger", isDefault: true },
  { name: "Rent", icon: "FaHome", isDefault: true },
  { name: "Transport", icon: "FaBus", isDefault: true },
  { name: "Electricity", icon: "FaBolt", isDefault: true },
  { name: "Water", icon: "FaTint", isDefault: true },
  { name: "Internet", icon: "FaWifi", isDefault: true },
  { name: "Mobile Recharge", icon: "FaMobileAlt", isDefault: true },
  { name: "Education", icon: "FaBook", isDefault: true },
  { name: "Health", icon: "FaHeartbeat", isDefault: true },
  { name: "Clothing", icon: "FaTshirt", isDefault: true },
  { name: "Entertainment", icon: "FaFilm", isDefault: true },
  { name: "Restaurant", icon: "FaUtensils", isDefault: true },
  { name: "Fuel", icon: "FaGasPump", isDefault: true },
  { name: "Gift", icon: "FaGift", isDefault: true },
  { name: "Other", icon: "FaEllipsisH", isDefault: true },
];

export const CATEGORY_ICONS = [
  "FaPills",
  "FaShoppingBasket",
  "FaCarrot",
  "FaHamburger",
  "FaHome",
  "FaBus",
  "FaBolt",
  "FaTint",
  "FaWifi",
  "FaMobileAlt",
  "FaBook",
  "FaHeartbeat",
  "FaTshirt",
  "FaFilm",
  "FaUtensils",
  "FaEllipsisH",
  "FaCoffee",
  "FaGasPump",
  "FaCut",
  "FaBaby",
  "FaDog",
  "FaGift",
  "FaMoneyBillWave",
  "FaCreditCard",
  "FaPiggyBank",
  "FaChartLine",
];

export const UNITS: { value: string; label: string }[] = [
  { value: "kg", label: "kg" },
  { value: "g", label: "g" },
  { value: "ml", label: "ml" },
  { value: "l", label: "L" },
  { value: "pcs", label: "pcs" },
  { value: "packet", label: "packet" },
  { value: "dozen", label: "dozen" },
  { value: "meter", label: "meter" },
  { value: "bundle", label: "bundle" },
];
