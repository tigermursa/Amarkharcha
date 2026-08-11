Project Doc file url : https://docs.google.com/document/d/1yHEU7rbLidq3o7W2zRoBsrzjNFI0_SUHX_TzeCgWdCo/edit?usp=sharing
Project Data Flow Architecture Image url:https://drive.google.com/file/d/1rSeJT1R3rsaxrT5jhKJScdBBjJtwl0td/view?usp=sharing

আমি আমার "Amar Kharcha" প্রোজেক্টে আবার কাজ শুরু করতে চাই।

[প্রোজেক্টের বর্তমান অবস্থা]:

- ইতিমধ্যে Next.js 14 (App Router) + TypeScript + Tailwind CSS v4 সেটআপ করা আছে।
- থিমিং: next-themes দিয়ে ডার্ক/লাইট মোড করা হয়েছে। ডার্ক মোডে গ্রিনিশ ভাইব (গাঢ় সবুজ ব্যাকগ্রাউন্ড, হালকা সবুজ টেক্সট)।
- গ্লোবাল CSS-এ CSS ভেরিয়েবল ব্যবহার করে থিম হ্যান্ডেল করা হচ্ছে (কোনো tailwind.config.js নেই)।
- হাইড্রেশন মিসম্যাচের জন্য layout.tsx-এ suppressHydrationWarning যোগ করা হয়েছে।
- বর্তমানে একটি হোমপেজ (dashboard) আছে যেখানে: Navbar, ThemeToggle, ৪টি স্ট্যাটিস্টিক কার্ড (ব্যালেন্স, আয়, ব্যয়, লেনদেন), সার্চ বার, একটি চার্ট প্লেসহোল্ডার ও সাম্প্রতিক লেনদেনের তালিকা (ডামি ডেটা) রয়েছে।

[আমি এখন পর্যন্ত যে ফাইলগুলো তৈরি করেছি]:

- app/layout.tsx
- app/page.tsx
- app/providers.tsx
- components/Navbar.tsx
- components/ThemeToggle.tsx
- app/globals.css (Tailwind v4 থিম ভেরিয়েবল সহ)

[এখন আমার যা করা দরকার / যে সমস্যায় আটকে আছি]:
[এখানে বিস্তারিত লেখো—যেমন: "এখন আমি MongoDB কানেক্ট করতে চাই", অথবা "RTK Query সেটআপ করতে গিয়ে এরর আসছে", অথবা "AI অ্যাসিস্টেন্টের API রাউট বানাতে হবে"]

[আমার বর্তমান কোড / এরর মেসেজ (যদি থাকে)]:
[এখানে প্রাসঙ্গিক কোড বা এরর মেসেজ পেস্ট করো]
