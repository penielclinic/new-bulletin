import { ScheduleItem } from "@/types/bulletin";

interface Props {
  items: ScheduleItem[];
}

const dayStyle: Record<string, { bg: string; text: string }> = {
  주일:   { bg: "#1b3252", text: "#fff" },
  월요일: { bg: "#4b5563", text: "#fff" },
  화요일: { bg: "#4b5563", text: "#fff" },
  수요일: { bg: "#1d4ed8", text: "#fff" },
  목요일: { bg: "#15803d", text: "#fff" },
  금요일: { bg: "#6d28d9", text: "#fff" },
  토요일: { bg: "#7c3aed", text: "#fff" },
};

export default function Schedule({ items }: Props) {
  return (
    <section>
      <h2 className="section-title">교회일정</h2>
      <div className="space-y-1.5">
        {items.map((item, idx) => {
          const ds = dayStyle[item.day] ?? { bg: "#6b7280", text: "#fff" };
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs"
              style={{ backgroundColor: "var(--cream)", border: "1px solid var(--gold-light)" }}
            >
              <span
                className="shrink-0 rounded px-1.5 py-0.5 text-xs font-bold"
                style={{ backgroundColor: ds.bg, color: ds.text }}
              >
                {item.day}
              </span>
              <span className="shrink-0 text-gray-500 w-14">{item.date}</span>
              <span
                className="shrink-0 font-bold w-10"
                style={{ color: "var(--gold-text)" }}
              >
                {item.time}
              </span>
              <span
                className="font-semibold"
                style={{ color: "var(--navy)" }}
              >
                {item.title}
              </span>
              {item.location && (
                <span className="ml-auto text-gray-400 shrink-0 hidden sm:inline">{item.location}</span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
