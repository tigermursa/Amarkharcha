import PrayerBoard from "../components/PrayerBoard";

async function getTimings() {
  const res = await fetch(
    "https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=1",
    { next: { revalidate: 3600 } },
  );

  if (!res.ok) throw new Error("নামাজের সময় আনতে ব্যর্থ");
  const json = await res.json();
  return json.data;
}

export default async function NamazPage() {
  const data = await getTimings();

  // 🔎 ডিবাগ: টার্মিনালে ডেটা ঠিক আসছে কিনা দেখুন
  console.log("API DATA:", data);

  return <PrayerBoard timings={data.timings} date={data.date} />;
}
