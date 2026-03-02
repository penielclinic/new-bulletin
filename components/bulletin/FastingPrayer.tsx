import { FastingPrayerItem } from "@/types/bulletin";

interface Props {
  items: FastingPrayerItem[];
}

export default function FastingPrayer({ items }: Props) {
  const dates = [...new Set(items.map((i) => i.prayer_date))].sort();

  return (
    <section>
      <h2 className="section-title">금식 · 중보기도</h2>
      <div className="overflow-x-auto">
      <div className="rounded-lg overflow-hidden border min-w-[280px]" style={{ borderColor: "var(--gold-light)" }}>
        <div className="grid grid-cols-4 px-3 py-1.5 text-xs font-bold text-white" style={{ backgroundColor: "var(--navy)" }}>
          <span>날짜</span><span>요일</span><span>금식</span><span>중보</span>
        </div>
        {dates.map((date, idx) => {
          const dayItems = items.filter((i) => i.prayer_date === date);
          const fasting = dayItems.find((i) => i.prayer_type === "금식");
          const intercession = dayItems.find((i) => i.prayer_type === "중보");
          const d = new Date(date);
          const label = `${d.getMonth() + 1}/${d.getDate()}`;
          return (
            <div key={date} className="grid grid-cols-4 px-3 py-1.5 text-xs" style={{ backgroundColor: idx % 2 === 0 ? "var(--cream)" : "white" }}>
              <span className="text-gray-500">{label}</span>
              <span className="font-semibold" style={{ color: "var(--navy)" }}>{fasting?.day_of_week ?? intercession?.day_of_week}</span>
              <span className="text-gray-700">{fasting ? `${fasting.member_name}` : "—"}</span>
              <span className="text-gray-700">{intercession ? `${intercession.member_name}` : "—"}</span>
            </div>
          );
        })}
      </div>
      </div>
    </section>
  );
}
