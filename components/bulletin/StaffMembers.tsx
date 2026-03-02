import { StaffMember } from "@/types/bulletin";

interface Props {
  items: StaffMember[];
}

const CATEGORY_ORDER = [
  "담임목사", "전임목사", "전임전도사", "교육전도사",
  "장로", "은퇴장로", "명예장로", "선교장로", "선교사",
  "성가대장", "지휘", "반주", "찬양팀장", "총무", "방송실",
];

export default function StaffMembers({ items }: Props) {
  const grouped = items.reduce<Record<string, StaffMember[]>>((acc, item) => {
    if (!acc[item.role_category]) acc[item.role_category] = [];
    acc[item.role_category].push(item);
    return acc;
  }, {});

  const orderedKeys = [
    ...CATEGORY_ORDER.filter((k) => grouped[k]),
    ...Object.keys(grouped).filter((k) => !CATEGORY_ORDER.includes(k)),
  ];

  return (
    <section>
      <h2 className="section-title">섬기는 분들</h2>
      <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--gold-light)" }}>
        {orderedKeys.map((category, idx) => (
          <div key={category} className="flex items-start gap-3 px-4 py-2 text-xs" style={{ backgroundColor: idx % 2 === 0 ? "var(--cream)" : "white" }}>
            <span className="shrink-0 font-semibold w-20" style={{ color: "var(--navy)" }}>{category}</span>
            <span className="text-gray-700 leading-5">
              {grouped[category].map((m) => m.member_name).join("  ")}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
