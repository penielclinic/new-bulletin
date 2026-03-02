import { MeetingItem } from "@/types/bulletin";

interface Props {
  items: MeetingItem[];
}

export default function Meetings({ items }: Props) {
  return (
    <section>
      <h2 className="section-title">모임안내</h2>
      <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--gold-light)" }}>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 px-4 py-2 text-xs" style={{ backgroundColor: idx % 2 === 0 ? "var(--cream)" : "white" }}>
            <span className="shrink-0 font-semibold w-28" style={{ color: "var(--navy)" }}>{item.meeting_name}</span>
            <span className="text-gray-600">{item.schedule}</span>
            {item.location && <span className="ml-auto shrink-0 text-gray-400">{item.location}</span>}
          </div>
        ))}
      </div>
    </section>
  );
}
