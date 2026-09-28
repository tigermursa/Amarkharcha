// lib/default-categories.ts
import { ICategory } from "@/types";

export const DEFAULT_CATEGORIES: Omit<
  ICategory,
  "_id" | "createdAt" | "userId"
>[] = [
  { name: "ঔষধ", icon: "FaPills", isDefault: true },
  { name: "মুদি", icon: "FaShoppingBasket", isDefault: true },
  { name: "কাঁচা বাজার", icon: "FaCarrot", isDefault: true },
  { name: "স্ন্যাকস", icon: "FaHamburger", isDefault: true },
  { name: "বাসা ভাড়া", icon: "FaHome", isDefault: true },
  { name: "যাতায়াত", icon: "FaBus", isDefault: true },
  { name: "বিদ্যুৎ বিল", icon: "FaBolt", isDefault: true },
  { name: "পানি বিল", icon: "FaTint", isDefault: true },
  { name: "ইন্টারনেট", icon: "FaWifi", isDefault: true },
  { name: "মোবাইল রিচার্জ", icon: "FaMobileAlt", isDefault: true },
  { name: "শিক্ষা", icon: "FaBook", isDefault: true },
  { name: "স্বাস্থ্য", icon: "FaHeartbeat", isDefault: true },
  { name: "পোশাক", icon: "FaTshirt", isDefault: true },
  { name: "বিনোদন", icon: "FaFilm", isDefault: true },
  { name: "রেস্টুরেন্ট", icon: "FaUtensils", isDefault: true },
  { name: "অন্যান্য", icon: "FaEllipsisH", isDefault: true },
];

// ক্যাটাগরি সিলেক্ট করার জন্য উপলব্ধ আইকন
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
