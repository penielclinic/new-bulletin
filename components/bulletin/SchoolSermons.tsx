import { SchoolSermon } from "@/types/bulletin";

interface Props {
  items: SchoolSermon[];
}

export default function SchoolSermons({ items }: Props) {
  return (
    <section>
      <h2 className="section-title">교회학교</h2>
      <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--gold-light)" }}>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3 px-4 py-2.5 text-xs" style={{ backgroundColor: idx % 2 === 0 ? "var(--cream)" : "white" }}>
            <span className="shrink-0 font-bold w-16" style={{ color: "var(--navy)" }}>{item.department}</span>
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{item.sermon_title}</p>
              <p className="text-gray-500 mt-0.5">{item.scripture} · {item.preacher}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
