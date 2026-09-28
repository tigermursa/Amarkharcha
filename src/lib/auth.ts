// lib/auth.ts
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import clientPromise from "./mongodb";

export const auth = betterAuth({
  database: mongodbAdapter((await clientPromise).db(), {
    client: await clientPromise,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // ৭ দিন
    updateAge: 60 * 60 * 24, // ১ দিন পর পর রিফ্রেশ
  },
  user: {
    additionalFields: {
      // ভবিষ্যতে ইউজারের জন্য অতিরিক্ত ফিল্ড দরকার হলে এখানে যোগ করবেন
    },
  },
  plugins: [nextCookies()],
});
