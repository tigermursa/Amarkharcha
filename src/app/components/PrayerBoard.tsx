"use client";

import { useEffect, useState } from "react";
import {
  MoonStar,
  Moon,
  Sun,
  CloudSun,
  Sunset,
  Sunrise,
  MapPin,
  CalendarDays,
  Clock,
  Hourglass,
  Check,
  BellRing,
  type LucideIcon,
} from "lucide-react";

type Timings = Record<string, string>;

interface Props {
  timings: Timings;
  date: {
    readable: string;
    hijri: {
      day: string;
      month: { en: string; number?: number };
      year: string;
    };
    gregorian: { weekday: { en: string } };
  };
}

const PRAYERS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "Fajr", label: "ফজর", Icon: MoonStar },
  { key: "Dhuhr", label: "যোহর", Icon: Sun },
  { key: "Asr", label: "আসর", Icon: CloudSun },
  { key: "Maghrib", label: "মাগরিব", Icon: Sunset },
  { key: "Isha", label: "ইশা", Icon: Moon },
];

const WEEKDAYS_BN: Record<string, string> = {
  Sunday: "রবিবার",
  Monday: "সোমবার",
  Tuesday: "মঙ্গলবার",
  Wednesday: "বুধবার",
  Thursday: "বৃহস্পতিবার",
  Friday: "শুক্রবার",
  Saturday: "শনিবার",
};

const MONTHS_BN = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const HIJRI_MONTHS_BN = [
  "মুহাররম",
  "সফর",
  "রবিউল আউয়াল",
  "রবিউস সানি",
  "জমাদিউল আউয়াল",
  "জমাদিউস সানি",
  "রজব",
  "শাবান",
  "রমজান",
  "শাওয়াল",
  "জিলকদ",
  "জিলহজ",
];

/* ---------- patterns ---------- */

const PATTERN = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'>
    <g fill='none' stroke='#fbbf24' stroke-opacity='0.07' stroke-width='1'>
      <path d='M40 4 L48 24 L68 16 L58 36 L76 40 L58 44 L68 64 L48 56 L40 76 L32 56 L12 64 L22 44 L4 40 L22 36 L12 16 L32 24 Z'/>
    </g>
  </svg>`,
);

/* ---------- helpers ---------- */

const toBn = (v: string | number): string =>
  String(v).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

function periodBn(h: number): string {
  if (h < 4) return "রাত";
  if (h < 6) return "ভোর";
  if (h < 12) return "সকাল";
  if (h < 15) return "দুপুর";
  if (h < 17) return "বিকাল";
  if (h < 19) return "সন্ধ্যা";
  return "রাত";
}

function parseTime(time: string, base: Date): Date {
  const [h, m] = time.trim().split(" ")[0].split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function splitTime(time?: string): { clock: string; period: string } {
  if (!time) return { clock: "--:--", period: "" };
  const [h, m] = time.trim().split(" ")[0].split(":").map(Number);
  const hour = h % 12 || 12;
  return {
    clock: toBn(`${hour}:${String(m).padStart(2, "0")}`),
    period: periodBn(h),
  };
}

// "ভোর ৪:৪০" — বাক্যের ভেতরে ব্যবহারের জন্য
function timeText(time?: string): string {
  const { clock, period } = splitTime(time);
  return `${period} ${clock}`.trim();
}

function formatClock(d: Date): string {
  const h = d.getHours();
  const hour = h % 12 || 12;
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${periodBn(h)} ${toBn(`${hour}:${mm}:${ss}`)}`;
}

function splitMs(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    h: Math.floor(total / 3600),
    m: Math.floor((total % 3600) / 60),
    s: total % 60,
  };
}

function formatGregorian(readable: string): string {
  const d = new Date(readable);
  if (isNaN(d.getTime())) return toBn(readable);
  return `${toBn(d.getDate())} ${MONTHS_BN[d.getMonth()]} ${toBn(d.getFullYear())}`;
}

/* ---------- small UI parts ---------- */

function TimeText({
  time,
  className = "",
}: {
  time?: string;
  className?: string;
}) {
  const { clock, period } = splitTime(time);
  return (
    <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
      <span className="tabular-nums">{clock}</span>
      <span className="text-[0.5em] font-semibold opacity-70">{period}</span>
    </span>
  );
}

function Countdown({
  ms,
  tone = "emerald",
}: {
  ms: number;
  tone?: "emerald" | "amber";
}) {
  const { h, m, s } = splitMs(ms);
  const parts = [
    { v: h, l: "ঘণ্টা" },
    { v: m, l: "মিনিট" },
    { v: s, l: "সেকেন্ড" },
  ];
  const numColor = tone === "amber" ? "text-amber-200" : "text-white";
  const lblColor =
    tone === "amber" ? "text-amber-200/60" : "text-emerald-100/60";

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      {parts.map((p, i) => (
        <div key={p.l} className="flex items-center gap-1.5 sm:gap-2">
          <div className="min-w-[3.6rem] sm:min-w-[4.4rem] rounded-xl bg-black/25 ring-1 ring-white/10 px-2 py-2 text-center">
            <p
              className={`text-3xl sm:text-4xl font-bold tabular-nums leading-none ${numColor}`}
            >
              {toBn(String(p.v).padStart(2, "0"))}
            </p>
            <p
              className={`mt-1 text-[10px] sm:text-xs font-medium ${lblColor}`}
            >
              {p.l}
            </p>
          </div>
          {i < parts.length - 1 && (
            <span className={`text-xl font-bold -mt-4 ${lblColor}`}>:</span>
          )}
        </div>
      ))}
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-28 w-28 sm:h-32 sm:w-32 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * pct) / 100}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
          {toBn(Math.round(pct))}%
        </span>
        <span className="text-[10px] sm:text-xs text-emerald-100/70">
          অতিক্রান্ত
        </span>
      </div>
    </div>
  );
}

/* ---------- main component ---------- */

export default function PrayerBoard({ timings, date }: Props) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!timings || !date) {
    return (
      <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-6">
        <p className="text-red-300 font-bold">
          ডেটা লোড হয়নি। timings বা date prop পাওয়া যায়নি।
        </p>
      </div>
    );
  }

  const reference = now ?? new Date();

  /* প্রতিটা ওয়াক্তের শুরু */
  const items = PRAYERS.map((p) => {
    const raw = timings[p.key] ?? "00:00";
    return { ...p, raw, start: parseTime(raw, reference) };
  });

  /* প্রতিটা ওয়াক্তের শেষ:
     ফজর → সূর্যোদয়, যোহর → আসর, আসর → মাগরিব, মাগরিব → ইশা, ইশা → রাত ১২টা */
  const itemsWithEnd = items.map((item, i) => {
    if (item.key === "Fajr") {
      return {
        ...item,
        end: parseTime(timings.Sunrise ?? "06:00", reference),
        endText: timeText(timings.Sunrise),
      };
    }
    if (item.key === "Isha") {
      const m = new Date(reference);
      m.setHours(24, 0, 0, 0);
      return {
        ...item,
        end: m,
        endText: "রাত ১২:০০".replace(/\d/g, (d) => toBn(d)),
      };
    }
    const next = items[i + 1];
    return { ...item, end: next.start, endText: timeText(next.raw) };
  });

  /* active ও next বের করা */
  let activeIdx = -1;
  let nextIdx = -1;

  if (now) {
    const t = now.getTime();
    activeIdx = itemsWithEnd.findIndex(
      (it) => it.start.getTime() <= t && t < it.end.getTime(),
    );
    nextIdx = itemsWithEnd.findIndex((it) => it.start.getTime() > t);
    if (nextIdx === -1) nextIdx = -2; // -2 = আগামীকালের ফজর
  }

  const current = activeIdx !== -1 ? itemsWithEnd[activeIdx] : null;

  let nextStart: Date | null = null;
  let nextName = "";
  let NextIcon: LucideIcon = MoonStar;
  let nextTimeRaw = "";
  let nextIsTomorrow = false;

  if (now) {
    if (nextIdx === -2) {
      const tomorrow = parseTime(timings.Fajr ?? "04:40", now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      nextStart = tomorrow;
      nextName = "ফজর";
      NextIcon = MoonStar;
      nextTimeRaw = timings.Fajr ?? "04:40";
      nextIsTomorrow = true;
    } else if (nextIdx >= 0) {
      const n = itemsWithEnd[nextIdx];
      nextStart = n.start;
      nextName = n.label;
      NextIcon = n.Icon;
      nextTimeRaw = n.raw;
    }
  }

  const msUntilCurrentEnd =
    current && now ? current.end.getTime() - now.getTime() : 0;
  const msUntilNextStart =
    nextStart && now ? nextStart.getTime() - now.getTime() : 0;

  let progressPct = 0;
  if (current && now) {
    const total = current.end.getTime() - current.start.getTime();
    const done = now.getTime() - current.start.getTime();
    progressPct =
      total > 0 ? Math.min(100, Math.max(0, (done / total) * 100)) : 0;
  }

  /* কোনো ওয়াক্ত না চললে কী লেখা হবে */
  const beforeFajr = now ? now.getTime() < items[0].start.getTime() : false;
  const idleTitle = beforeFajr ? "রাতের শেষাংশ" : "সূর্যোদয় পরবর্তী সময়";

  /* তারিখ */
  const weekday =
    WEEKDAYS_BN[date.gregorian.weekday.en] ?? date.gregorian.weekday.en;
  const hijriMonth =
    date.hijri.month.number && HIJRI_MONTHS_BN[date.hijri.month.number - 1]
      ? HIJRI_MONTHS_BN[date.hijri.month.number - 1]
      : date.hijri.month.en;

  const isFriday = date.gregorian.weekday.en === "Friday";

  return (
    <main
      className="min-h-screen bg-gradient-to-b from-emerald-950 via-[#06281f] to-[#04181a] text-emerald-50 px-3 py-5 sm:px-6 sm:py-8"
      style={{ backgroundImage: undefined }}
    >
      {/* ইসলামিক জ্যামিতিক প্যাটার্ন */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ backgroundImage: `url("data:image/svg+xml,${PATTERN}")` }}
      />
      {/* সোনালি গ্লো */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-32 left-1/2 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-amber-400/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-4xl space-y-4 sm:space-y-5">
        {/* ───────── হেডার ───────── */}
        <header className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur-md sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-300/90">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">ঢাকা, বাংলাদেশ</span>
              </div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight sm:text-4xl">
                নামাজের সময়সূচি
              </h1>
            </div>

            {now && (
              <div className="rounded-2xl bg-black/25 px-4 py-2 text-right ring-1 ring-white/10">
                <p className="flex items-center justify-end gap-1.5 text-[11px] font-semibold text-emerald-300/80">
                  <Clock className="h-3 w-3" /> এখন সময়
                </p>
                <p className="text-lg font-bold tabular-nums sm:text-xl">
                  {formatClock(now)}
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-emerald-500/15 p-2.5 text-emerald-300 ring-1 ring-emerald-400/20">
                <CalendarDays className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">
                  {weekday}, {formatGregorian(date.readable)}
                  {isFriday && (
                    <span className="ml-2 rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-200">
                      জুমার দিন
                    </span>
                  )}
                </p>
                <p className="text-sm text-emerald-200/70">
                  {toBn(date.hijri.day)} {hijriMonth}, {toBn(date.hijri.year)}{" "}
                  হিজরি
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
              <div className="rounded-2xl bg-amber-400/10 px-4 py-2.5 ring-1 ring-amber-300/20">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
                  <Sunrise className="h-3.5 w-3.5" /> সূর্যোদয়
                </p>
                <TimeText
                  time={timings.Sunrise}
                  className="mt-0.5 text-lg font-bold"
                />
              </div>
              <div className="rounded-2xl bg-rose-400/10 px-4 py-2.5 ring-1 ring-rose-300/20">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-300">
                  <Sunset className="h-3.5 w-3.5" /> সূর্যাস্ত
                </p>
                <TimeText
                  time={timings.Sunset}
                  className="mt-0.5 text-lg font-bold"
                />
              </div>
            </div>
          </div>
        </header>

        {/* ───────── হিরো কার্ড (চলমান + পরবর্তী) ───────── */}
        {now && (
          <section className="grid gap-4 md:grid-cols-5">
            {/* চলমান ওয়াক্ত */}
            {current ? (
              <div className="relative overflow-hidden rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 shadow-2xl sm:p-6 md:col-span-3">
                <current.Icon className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 text-white/[0.06]" />

                <p className="relative flex items-center gap-2 text-xs font-bold text-emerald-100">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
                  </span>
                  এখন চলছে
                </p>

                <div className="relative mt-3 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
                      {current.label}
                    </h2>
                    <p className="mt-1 text-sm text-emerald-100/80">
                      শুরু {timeText(current.raw)} · শেষ {current.endText}
                    </p>
                  </div>
                  <Ring pct={progressPct} />
                </div>

                <div className="relative mt-5 border-t border-white/15 pt-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-100/80">
                    <Hourglass className="h-3.5 w-3.5" />
                    এই ওয়াক্ত শেষ হতে বাকি
                  </p>
                  <Countdown ms={msUntilCurrentEnd} />
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-2xl sm:p-6 md:col-span-3">
                <Moon className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 text-white/[0.05]" />
                <p className="text-xs font-bold text-emerald-300/80">এখন</p>
                <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                  {idleTitle}
                </h2>
                <p className="mt-2 text-sm text-emerald-200/70">
                  এই মুহূর্তে কোনো ফরজ নামাজের ওয়াক্ত চলছে না।
                </p>
              </div>
            )}

            {/* পরবর্তী ওয়াক্ত */}
            <div className="relative overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-br from-[#2b2410] via-[#1d2a1c] to-[#0e2a23] p-5 shadow-2xl sm:p-6 md:col-span-2">
              <NextIcon className="pointer-events-none absolute -right-5 -top-5 h-36 w-36 text-amber-300/[0.07]" />

              <p className="relative flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <BellRing className="h-3.5 w-3.5" />
                পরবর্তী ওয়াক্ত
              </p>

              <h2 className="relative mt-3 text-3xl font-extrabold text-white sm:text-4xl">
                {nextName}
              </h2>
              <p className="relative mt-1 text-sm text-amber-100/80">
                শুরু {timeText(nextTimeRaw)}
                {nextIsTomorrow && " (আগামীকাল)"}
              </p>

              <div className="relative mt-5 border-t border-white/10 pt-4">
                <p className="mb-2 text-xs font-semibold text-amber-300/80">
                  শুরু হতে বাকি
                </p>
                <Countdown ms={msUntilNextStart} tone="amber" />
              </div>
            </div>
          </section>
        )}

        {/* ───────── ওয়াক্তের তালিকা ───────── */}
        <section className="space-y-2.5 sm:space-y-3">
          {itemsWithEnd.map((p, i) => {
            const isActive = i === activeIdx;
            const isPast = !!now && now.getTime() >= p.end.getTime();
            const isNext = i === nextIdx;

            const box = isActive
              ? "border-emerald-400/60 bg-gradient-to-r from-emerald-700/70 to-teal-800/60 shadow-xl shadow-emerald-950/60 sm:scale-[1.015]"
              : isNext
                ? "border-amber-400/40 bg-amber-400/[0.06]"
                : isPast
                  ? "border-white/5 bg-white/[0.02] opacity-55"
                  : "border-white/10 bg-white/[0.04]";

            const iconBox = isActive
              ? "bg-emerald-400/25 text-emerald-100 ring-emerald-300/40"
              : isNext
                ? "bg-amber-400/15 text-amber-300 ring-amber-300/30"
                : isPast
                  ? "bg-white/5 text-emerald-300/50 ring-white/5"
                  : "bg-emerald-500/10 text-emerald-300 ring-emerald-400/20";

            return (
              <div
                key={p.key}
                className={`relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border p-4 transition-all duration-300 sm:p-5 ${box}`}
              >
                {isActive && (
                  <span className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-emerald-200 to-teal-300" />
                )}

                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ring-1 sm:h-14 sm:w-14 ${iconBox}`}
                  >
                    <p.Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-lg font-bold leading-tight sm:text-xl">
                      {p.label}
                    </p>

                    {isActive && (
                      <span className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-2 py-0.5 text-[11px] font-bold text-emerald-200">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                        চলছে
                      </span>
                    )}
                    {isNext && !isActive && (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] font-bold text-amber-200">
                        <BellRing className="h-3 w-3" />
                        পরবর্তী
                      </span>
                    )}
                    {isPast && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300/60">
                        <Check className="h-3 w-3" />
                        শেষ হয়েছে
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <TimeText
                    time={p.raw}
                    className="text-2xl font-extrabold sm:text-3xl"
                  />
                  <p className="mt-0.5 text-[11px] text-emerald-200/60 sm:text-xs">
                    শেষ {p.endText}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        <footer className="pb-4 pt-2 text-center text-xs text-emerald-300/50">
          তথ্যসূত্র: AlAdhan API · পদ্ধতি: University of Islamic Sciences,
          Karachi
        </footer>
      </div>
    </main>
  );
}
