import { AutonomousGroup } from "@/types/bulletin";

interface Props {
  items: AutonomousGroup[];
}

export default function AutonomousGroups({ items }: Props) {
  return (
    <section>
      <h2 className="section-title">자치기관</h2>
      <div className="overflow-x-auto">
      <div className="rounded-lg overflow-hidden border min-w-[300px]" style={{ borderColor: "var(--gold-light)" }}>
        <div className="grid grid-cols-4 px-3 py-1.5 text-xs font-bold text-white" style={{ backgroundColor: "var(--navy)" }}>
          <span>기관명</span><span>대상</span><span>대표</span><span>장소</span>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="grid grid-cols-4 px-3 py-1.5 text-xs" style={{ backgroundColor: idx % 2 === 0 ? "var(--cream)" : "white" }}>
            <span className="font-semibold" style={{ color: "var(--navy)" }}>{item.group_name}</span>
            <span className="text-gray-600">{item.age_range}</span>
            <span className="text-gray-700">{item.representative}</span>
            <span className="text-gray-500">{item.location}</span>
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}
