"use client";

import { useEffect, useState } from "react";

type Timings = Record<string, string>;

interface Props {
  timings: Timings;
  date: {
    readable: string;
    hijri: { day: string; month: { en: string }; year: string };
    gregorian: { weekday: { en: string } };
  };
}

const PRAYERS = [
  { key: "Fajr", label: "ফজর", icon: "🌙" },
  { key: "Dhuhr", label: "যোহর", icon: "☀️" },
  { key: "Asr", label: "আসর", icon: "🌤️" },
  { key: "Maghrib", label: "মাগরিব", icon: "🌆" },
  { key: "Isha", label: "ইশা", icon: "🌃" },
] as const;

function parseTime(time: string, base: Date): Date {
  const [h, m] = time.trim().split(" ")[0].split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function to12h(time: string): string {
  if (!time) return "--:--";
  const [h, m] = time.trim().split(" ")[0].split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function PrayerBoard({ timings, date }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // 🔴 গার্ড: timings বা date না এলে crash না করে মেসেজ দেখাবে
  if (!timings || !date) {
    return (
      <div className="p-10 text-center text-red-600 font-bold">
        ❌ timings বা date prop আসেনি। page.tsx থেকে ঠিকভাবে পাস হচ্ছে কিনা
        দেখুন।
      </div>
    );
  }

  const reference = now ?? new Date();

  const list = PRAYERS.map((p) => {
    const raw = timings[p.key] ?? "00:00";
    const t = parseTime(raw, reference);
    return {
      ...p,
      date: t,
      timeStr: raw,
      isPast: now ? t.getTime() <= now.getTime() : false,
    };
  });

  const nextToday = now ? list.find((p) => !p.isPast) : null;

  let countdownTarget: Date | null = null;
  let bannerTitle = "";
  let bannerSub = "";

  if (now) {
    if (nextToday) {
      countdownTarget = nextToday.date;
      bannerTitle = `${nextToday.icon} ${nextToday.label}`;
      bannerSub = to12h(nextToday.timeStr);
    } else {
      const fajrTomorrow = parseTime(timings.Fajr ?? "04:40", now);
      fajrTomorrow.setDate(fajrTomorrow.getDate() + 1);
      countdownTarget = fajrTomorrow;
      bannerTitle = "🌙 ফজর (আগামীকাল)";
      bannerSub = to12h(timings.Fajr ?? "04:40");
    }
  }

  const countdownMs =
    countdownTarget && now
      ? Math.max(0, countdownTarget.getTime() - now.getTime())
      : 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 p-6">
      <div className="max-w-3xl mx-auto">
        <header className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 mb-4 border border-emerald-100">
          <h1 className="text-3xl font-bold text-emerald-800">
            🕌 ঢাকার নামাজের সময়সূচি
          </h1>

          <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
            <div>
              <p className="text-gray-700 font-medium">
                {date.readable} • {date.gregorian.weekday.en}
              </p>
              <p className="text-gray-500 text-sm">
                {date.hijri.day} {date.hijri.month.en} {date.hijri.year} হিজরি
              </p>
            </div>

            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wider text-orange-500 font-semibold">
                  🌅 সূর্যোদয়
                </p>
                <p className="text-lg font-bold text-gray-800 tabular-nums">
                  {to12h(timings.Sunrise)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-wider text-rose-500 font-semibold">
                  🌇 সূর্যাস্ত
                </p>
                <p className="text-lg font-bold text-gray-800 tabular-nums">
                  {to12h(timings.Sunset)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {now && countdownTarget && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl shadow-lg p-5 mb-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-widest opacity-80">
                পরবর্তী ওয়াক্ত
              </p>
              <p className="text-2xl font-bold mt-0.5">{bannerTitle}</p>
              <p className="text-sm opacity-90">{bannerSub}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-widest opacity-80">
                বাকি আছে
              </p>
              <p className="text-4xl font-mono font-bold tabular-nums mt-0.5">
                {formatCountdown(countdownMs)}
              </p>
            </div>
          </div>
        )}

        <section className="space-y-3">
          {list.map((p) => {
            const isNext = nextToday?.key === p.key;
            const isPast = p.isPast;

            return (
              <div
                key={p.key}
                className={[
                  "flex items-center justify-between rounded-2xl p-5",
                  "border-l-4 shadow-md transition-all duration-300",
                  isPast
                    ? "bg-gray-100 border-gray-300 opacity-55 grayscale"
                    : isNext
                      ? "bg-white border-emerald-500 ring-2 ring-emerald-300 shadow-emerald-200 scale-[1.01]"
                      : "bg-white border-emerald-300",
                ].join(" ")}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-3xl ${isPast ? "opacity-50" : ""}`}>
                    {p.icon}
                  </span>
                  <div>
                    <p
                      className={`text-lg font-bold ${
                        isPast ? "text-gray-500" : "text-emerald-800"
                      }`}
                    >
                      {p.label}
                    </p>
                    {isPast && (
                      <span className="inline-block text-[11px] text-gray-400 font-medium">
                        ✓ শেষ হয়েছে
                      </span>
                    )}
                    {isNext && (
                      <span className="inline-block text-[11px] text-emerald-600 font-semibold">
                        ● এখন চলছে
                      </span>
                    )}
                  </div>
                </div>

                <p
                  className={`text-2xl font-bold tabular-nums ${
                    isPast ? "text-gray-500" : "text-emerald-700"
                  }`}
                >
                  {to12h(p.timeStr)}
                </p>
              </div>
            );
          })}
        </section>

        <footer className="text-center text-xs text-gray-500 mt-8">
          Data source: AlAdhan API • Method: University of Islamic Sciences,
          Karachi
        </footer>
      </div>
    </main>
  );
}
