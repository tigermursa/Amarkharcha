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

/* ---------- helpers ---------- */

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

function formatClock(d: Date): string {
  const h = d.getHours();
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(d.getMinutes()).padStart(2, "0")}:${String(
    d.getSeconds(),
  ).padStart(2, "0")} ${period}`;
}

/* ---------- component ---------- */

export default function PrayerBoard({ timings, date }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!timings || !date) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950 flex items-center justify-center p-6">
        <p className="text-red-300 font-bold">❌ timings বা date prop আসেনি।</p>
      </div>
    );
  }

  const reference = now ?? new Date();

  // প্রতিটা ওয়াক্তের start
  const items = PRAYERS.map((p) => {
    const raw = timings[p.key] ?? "00:00";
    return { ...p, raw, start: parseTime(raw, reference) };
  });

  // প্রতিটা ওয়াক্তের end:
  //  - Fajr / Dhuhr / Asr / Maghrib → পরের ওয়াক্তের start
  //  - Isha → রাত ১২টা (00:00 পরদিন)
  const itemsWithEnd = items.map((item, i) => {
    if (item.key === "Isha") {
      const m = new Date(reference);
      m.setHours(24, 0, 0, 0);
      return { ...item, end: m };
    }
    const next = items[i + 1];
    return { ...item, end: next ? next.start : item.start };
  });

  // ── active ওয়াক্ত: start ≤ now < end ──
  let activeIdx = -1;
  let nextIdx = -1;

  if (now) {
    for (let i = 0; i < itemsWithEnd.length; i++) {
      const it = itemsWithEnd[i];
      if (
        it.start.getTime() <= now.getTime() &&
        now.getTime() < it.end.getTime()
      ) {
        activeIdx = i;
        break;
      }
    }
    for (let i = 0; i < itemsWithEnd.length; i++) {
      if (itemsWithEnd[i].start.getTime() > now.getTime()) {
        nextIdx = i;
        break;
      }
    }
    if (nextIdx === -1) nextIdx = -2; // -2 = আগামীকালের ফজর
  }

  // ── current ওয়াক্তের তথ্য ──
  const current = activeIdx !== -1 ? itemsWithEnd[activeIdx] : null;

  // ── next ওয়াক্তের তথ্য ──
  let nextStart: Date | null = null;
  let nextName = "";
  let nextIcon = "";
  let nextTimeStr = "";

  if (now) {
    if (nextIdx === -2) {
      const tomorrow = parseTime(timings.Fajr ?? "04:40", now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      nextStart = tomorrow;
      nextName = "ফজর";
      nextIcon = "🌙";
      nextTimeStr = `${to12h(timings.Fajr ?? "04:40")} (আগামীকাল)`;
    } else if (nextIdx >= 0) {
      const n = itemsWithEnd[nextIdx];
      nextStart = n.start;
      nextName = n.label;
      nextIcon = n.icon;
      nextTimeStr = to12h(n.raw);
    }
  }

  // ── দুইটা আলাদা countdown ──
  const msUntilCurrentEnd =
    current && now ? Math.max(0, current.end.getTime() - now.getTime()) : 0;
  const msUntilNextStart =
    nextStart && now ? Math.max(0, nextStart.getTime() - now.getTime()) : 0;

  // ── progress bar (শুধু current থাকলে) ──
  let progressPct = 0;
  if (current && now) {
    const total = current.end.getTime() - current.start.getTime();
    const done = now.getTime() - current.start.getTime();
    progressPct =
      total > 0 ? Math.min(100, Math.max(0, (done / total) * 100)) : 0;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-950 via-green-900 to-teal-950 p-6">
      <div className="max-w-3xl mx-auto">
        {/* ── হেডার ── */}
        <header className="bg-emerald-900/40 backdrop-blur-md rounded-2xl border border-emerald-700/40 shadow-xl p-6 mb-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <h1 className="text-3xl font-bold text-emerald-50 tracking-tight">
              🕌 ঢাকার নামাজের সময়সূচি
            </h1>
            {now && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-emerald-300/70 font-semibold">
                  এখন
                </p>
                <p className="text-lg font-mono font-bold text-emerald-50 tabular-nums">
                  {formatClock(now)}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
            <div>
              <p className="text-emerald-100 font-medium text-base">
                {date.readable} • {date.gregorian.weekday.en}
              </p>
              <p className="text-emerald-300/80 text-sm mt-0.5">
                {date.hijri.day} {date.hijri.month.en} {date.hijri.year} হিজরি
              </p>
            </div>

            <div className="flex gap-6">
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-widest text-amber-300/90 font-semibold">
                  🌅 সূর্যোদয়
                </p>
                <p className="text-lg font-bold text-emerald-50 tabular-nums mt-0.5">
                  {to12h(timings.Sunrise)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-widest text-rose-300/90 font-semibold">
                  🌇 সূর্যাস্ত
                </p>
                <p className="text-lg font-bold text-emerald-50 tabular-nums mt-0.5">
                  {to12h(timings.Sunset)}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ── দুইটা স্ট্যাট কার্ড ── */}
        {now && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* কার্ড ১: current ওয়াক্ত শেষ হতে বাকি */}
            {current ? (
              <div className="bg-gradient-to-br from-emerald-700 to-teal-700 rounded-2xl shadow-xl p-5 border border-emerald-500/30">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-widest text-emerald-200/90 font-semibold">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse mr-1.5 align-middle" />
                    এখন চলছে
                  </p>
                  <span className="text-2xl">{current.icon}</span>
                </div>

                <p className="text-2xl font-bold text-white mt-1">
                  {current.label}
                </p>
                <p className="text-sm text-emerald-100/90">
                  শুরু {to12h(current.raw)}
                </p>

                <div className="mt-4 pt-4 border-t border-white/15">
                  <p className="text-[11px] uppercase tracking-widest text-emerald-200/90 font-semibold">
                    এই ওয়াক্ত শেষ হতে বাকি
                  </p>
                  <p className="text-4xl font-mono font-bold text-white tabular-nums mt-1">
                    {formatCountdown(msUntilCurrentEnd)}
                  </p>
                  <p className="text-[11px] text-emerald-100/70 mt-1">
                    {current.key === "Isha"
                      ? "শেষ হবে রাত ১২:০০ টায়"
                      : `শেষ হবে ${to12h(items[activeIdx + 1]?.raw ?? "")}-এ`}
                  </p>
                </div>

                <div className="mt-3">
                  <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-300 to-teal-200 transition-all duration-1000"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-emerald-200/70 mt-1 text-right tabular-nums">
                    {progressPct.toFixed(0)}% অতিক্রান্ত
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-900/60 rounded-2xl shadow-xl p-5 border border-emerald-700/40">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-widest text-emerald-300/80 font-semibold">
                    এখন
                  </p>
                  <span className="text-2xl">🌌</span>
                </div>
                <p className="text-2xl font-bold text-emerald-100 mt-1">
                  রাতের শেষাংশ
                </p>
                <p className="text-sm text-emerald-300/80">
                  কোনো ওয়াক্ত চলছে না
                </p>
                <p className="text-xs text-emerald-200/60 mt-4 border-t border-white/10 pt-3">
                  ফজরের অপেক্ষা করুন
                </p>
              </div>
            )}

            {/* কার্ড ২: next ওয়াক্ত শুরু হতে বাকি */}
            <div className="bg-emerald-900/60 backdrop-blur rounded-2xl shadow-xl p-5 border border-amber-500/30">
              <div className="flex items-center justify-between">
                <p className="text-[11px] uppercase tracking-widest text-amber-300/90 font-semibold">
                  পরবর্তী ওয়াক্ত
                </p>
                <span className="text-2xl">{nextIcon}</span>
              </div>

              <p className="text-2xl font-bold text-white mt-1">{nextName}</p>
              <p className="text-sm text-amber-100/90">
                শুরু হবে {nextTimeStr}
              </p>

              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[11px] uppercase tracking-widest text-amber-300/90 font-semibold">
                  শুরু হতে বাকি
                </p>
                <p className="text-4xl font-mono font-bold text-amber-200 tabular-nums mt-1">
                  {formatCountdown(msUntilNextStart)}
                </p>
              </div>

              <p className="text-[11px] text-amber-200/60 mt-3">
                ⏱ আজমতের জন্য প্রস্তুতি নিন
              </p>
            </div>
          </div>
        )}

        {/* ── ওয়াক্তের লিস্ট ── */}
        <section className="space-y-3">
          {itemsWithEnd.map((p, i) => {
            const isActive = i === activeIdx;
            const isPast =
              activeIdx !== -1
                ? i < activeIdx
                : p.end.getTime() <= (now?.getTime() ?? 0);
            const isNext = i === nextIdx;

            return (
              <div
                key={p.key}
                className={[
                  "relative flex items-center justify-between rounded-2xl p-5",
                  "border transition-all duration-300 overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-emerald-800/90 to-teal-800/90 border-emerald-400 shadow-xl shadow-emerald-900/50 scale-[1.02]"
                    : isPast
                      ? "bg-emerald-950/40 border-emerald-800/30 opacity-50"
                      : isNext
                        ? "bg-emerald-900/50 border-amber-500/50 shadow-lg"
                        : "bg-emerald-900/35 border-emerald-700/40",
                ].join(" ")}
              >
                {isActive && (
                  <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-300 via-emerald-400 to-teal-300" />
                )}

                <div className="flex items-center gap-4">
                  <span
                    className={`text-3xl ${
                      isPast ? "opacity-40 grayscale" : ""
                    }`}
                  >
                    {p.icon}
                  </span>
                  <div>
                    <p
                      className={`text-lg font-bold ${
                        isActive
                          ? "text-white"
                          : isPast
                            ? "text-emerald-400/60"
                            : "text-emerald-100"
                      }`}
                    >
                      {p.label}
                    </p>

                    {isActive && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        এখন চলছে
                      </span>
                    )}
                    {isNext && (
                      <span className="inline-block text-[11px] font-semibold text-amber-300 mt-0.5">
                        ● পরবর্তী
                      </span>
                    )}
                    {isPast && (
                      <span className="inline-block text-[11px] font-medium text-emerald-400/50 mt-0.5">
                        ✓ শেষ হয়েছে
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-2xl font-bold tabular-nums ${
                      isActive
                        ? "text-white"
                        : isPast
                          ? "text-emerald-400/60"
                          : isNext
                            ? "text-amber-100"
                            : "text-emerald-100"
                    }`}
                  >
                    {to12h(p.raw)}
                  </p>
                  {p.key === "Isha" && (
                    <p className="text-[10px] text-emerald-300/60 mt-0.5">
                      শেষ ১২:০০ AM
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <footer className="text-center text-xs text-emerald-400/60 mt-8">
          Data source: AlAdhan API • Method: University of Islamic Sciences,
          Karachi
        </footer>
      </div>
    </main>
  );
}
