import Navbar from "./components/Navbar";

import ThemeToggle from "./components/ThemeToggle";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  Search,
  PlusCircle,
} from "lucide-react";

export default function Home() {
  // ডামি ডেটা
  const transactions = [
    {
      id: 1,
      title: "দুপুরের খাবার",
      amount: -250,
      category: "খাবার",
      date: "আজ, ২:৩০ PM",
    },
    {
      id: 2,
      title: "বেতন",
      amount: 15000,
      category: "আয়",
      date: "গতকাল, ১০:০০ AM",
    },
    {
      id: 3,
      title: "ইউটিলিটি বিল",
      amount: -1200,
      category: "বিল",
      date: "২ আগস্ট, ৬:০০ PM",
    },
    {
      id: 4,
      title: "ফ্রিল্যান্স ইনকাম",
      amount: 5000,
      category: "আয়",
      date: "১ আগস্ট, ৮:০০ PM",
    },
  ];

  const totalBalance = 18550;
  const totalIncome = 20000;
  const totalExpense = 1450;

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* ন্যাভবার */}
      <Navbar />

      {/* প্রধান কন্টেন্ট */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* হেডার + সার্চ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ড্যাশবোর্ড</h1>
            <p className="text-muted-foreground">আপনার আয়-ব্যয়ের সারসংক্ষেপ</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="সার্চ করুন..."
                className="pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-60"
              />
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <PlusCircle className="w-4 h-4" />
              <span>যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* স্ট্যাটিস্টিক কার্ড (উইজেট) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Wallet className="w-5 h-5" />}
            title="মোট ব্যালেন্স"
            value={`৳${totalBalance.toLocaleString()}`}
            trend="+২.৫%"
            trendUp
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="মোট আয়"
            value={`৳${totalIncome.toLocaleString()}`}
            trend="+৮.১%"
            trendUp
          />
          <StatCard
            icon={<TrendingDown className="w-5 h-5" />}
            title="মোট ব্যয়"
            value={`৳${totalExpense.toLocaleString()}`}
            trend="-৩.২%"
            trendUp={false}
          />
          <StatCard
            icon={<Calendar className="w-5 h-5" />}
            title="এই মাসে লেনদেন"
            value="২৪"
            trend="+৪"
            trendUp
          />
        </div>

        {/* চার্ট ও ট্রানজেকশন লিস্ট */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* চার্ট প্লেসহোল্ডার (বামে) */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">আয়-ব্যয়ের গ্রাফ</h2>
            <div className="h-64 flex items-center justify-center bg-muted/10 rounded-xl border border-border border-dashed">
              <span className="text-muted-foreground">[চার্ট এখানে আসবে]</span>
            </div>
            <div className="flex justify-around mt-4 text-sm text-muted-foreground">
              <span>● আয়</span>
              <span>● ব্যয়</span>
            </div>
          </div>

          {/* সাম্প্রতিক লেনদেন (ডানে) */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">সাম্প্রতিক লেনদেন</h2>
              <button className="text-sm text-primary hover:underline">
                সব দেখুন
              </button>
            </div>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/10 transition-colors"
                >
                  <div>
                    <p className="font-medium">{tx.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {tx.category} • {tx.date}
                    </p>
                  </div>
                  <span
                    className={`font-semibold ${tx.amount < 0 ? "text-red-500" : "text-green-600 dark:text-green-400"}`}
                  >
                    {tx.amount < 0 ? "-" : "+"}৳
                    {Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ফুটার (ঐচ্ছিক) */}
        <div className="text-center text-sm text-muted-foreground border-t border-border pt-6">
          Amar Kharcha v1.0 • সব হিসাব-নিকাশ আপনার নিয়ন্ত্রণে
        </div>
      </div>
    </main>
  );
}

// স্ট্যাটিস্টিক কার্ডের জন্য ছোট কম্পোনেন্ট (পেজের ভেতরেই)
function StatCard({
  icon,
  title,
  value,
  trend,
  trendUp,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <span
          className={`text-xs font-medium ${trendUp ? "text-green-600 dark:text-green-400" : "text-red-500"}`}
        >
          {trend}
        </span>
      </div>
      <div className="mt-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
