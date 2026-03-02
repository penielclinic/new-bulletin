import { WorshipCommitteeItem } from "@/types/bulletin";

interface Props {
  items: WorshipCommitteeItem[];
}

const ROLE_ORDER = ["예배위원(선교회)", "사회", "기도인도", "헌금위원", "정문", "3층", "실내", "중층", "중식"];

export default function WorshipCommittee({ items }: Props) {
  const 금주 = items.filter((r) => r.week_type === "금주");
  const 차주 = items.filter((r) => r.week_type === "차주");

  const getMembers = (list: WorshipCommitteeItem[], role: string) => {
    const matched = list.filter((r) => r.role_type === role);
    if (matched.length === 0) return null;
    return matched.map((r) => (r.service_part ? `${r.service_part}: ${r.member_name}` : r.member_name)).join(" / ");
  };

  const roles = ROLE_ORDER.filter(
    (role) => items.some((r) => r.role_type === role)
  );

  return (
    <section>
      <h2 className="section-title">예배위원</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {[{ label: "금 주", data: 금주 }, { label: "차 주", data: 차주 }].map(({ label, data }) => (
          <div key={label} className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--gold-light)" }}>
            <div className="px-3 py-1.5 text-center text-xs font-bold text-white" style={{ backgroundColor: "var(--navy)" }}>
              {label}
            </div>
            {roles.map((role, idx) => {
              const val = getMembers(data, role);
              return (
                <div key={role} className="flex gap-2 px-3 py-1.5 text-xs" style={{ backgroundColor: idx % 2 === 0 ? "var(--cream)" : "white" }}>
                  <span className="shrink-0 font-semibold w-20" style={{ color: "var(--navy)" }}>{role}</span>
                  <span className="text-gray-600 leading-4">{val ?? "—"}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
