import { WorshipCommitteeItem } from "@/types/bulletin";

interface Props {
  items: WorshipCommitteeItem[];
}

const ROLE_ORDER = ["예배위원(선교회)", "사회", "기도인도", "헌금위원", "정문", "3층", "실내", "중층", "중식"];

export default function WorshipCommittee({ items }: Props) {
  const 금주 = items.filter((r) => r.week_type === "금주");
  const 차주 = items.filter((r) => r.week_type === "차주");

  const getEntries = (list: WorshipCommitteeItem[], role: string) => {
    const matched = list.filter((r) => r.role_type === role);
    if (matched.length === 0) return null;
    // 부가 있는 경우(사회, 기도인도): "1부: 이름 / 2부: 이름" 형태로 파트별 분리
    return matched.map((r) => ({
      prefix: r.service_part ? `${r.service_part}: ` : "",
      names: r.member_name.split(/\s+/).filter(Boolean),
    }));
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
              const entries = getEntries(data, role);
              return (
                <div key={role} className="flex gap-2 px-3 py-1.5 text-xs" style={{ backgroundColor: idx % 2 === 0 ? "var(--cream)" : "white" }}>
                  <span className="shrink-0 font-semibold w-20" style={{ color: "var(--navy)" }}>{role}</span>
                  <div className="text-gray-600 leading-5 min-w-0">
                    {entries ? (
                      entries.map((entry, ei) => (
                        <div key={ei} className="flex flex-wrap gap-x-1">
                          {entry.prefix && <span className="shrink-0 text-gray-500">{entry.prefix}</span>}
                          {entry.names.map((name, ni) => (
                            <span key={ni} className="whitespace-nowrap">{name}</span>
                          ))}
                        </div>
                      ))
                    ) : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
