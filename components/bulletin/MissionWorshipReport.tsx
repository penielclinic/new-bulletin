import { MissionWorshipReportItem } from "@/types/bulletin";

interface Props {
  items: MissionWorshipReportItem[];
}

function parseGroupName(name: string): { group: string; num: number } {
  const m = name.match(/^(.+?)\s+(\d+)순$/);
  return m ? { group: m[1], num: parseInt(m[2]) } : { group: name, num: 0 };
}

function parseNotes(notes: string | null): Record<string, string> {
  if (!notes) return {};
  const result: Record<string, string> = {};
  notes.split(",").forEach((part) => {
    const idx = part.indexOf(":");
    if (idx !== -1) {
      const key = part.slice(0, idx).trim();
      const val = part.slice(idx + 1).trim();
      if (key && val) result[key] = val;
    }
  });
  return result;
}

export default function MissionWorshipReport({ items }: Props) {
  // 선교회별로 그룹핑
  const groupMap = new Map<string, MissionWorshipReportItem[]>();
  items.forEach((item) => {
    const { group } = parseGroupName(item.group_name);
    if (!groupMap.has(group)) groupMap.set(group, []);
    groupMap.get(group)!.push(item);
  });

  return (
    <section>
      <h2 className="section-title">선교회별 예배보고현황</h2>
      <div className="space-y-4">
        {[...groupMap.entries()].map(([group, rows]) => (
          <div key={group}>
            <p className="text-xs font-bold mb-1 px-0.5" style={{ color: "var(--navy)" }}>
              {group}
            </p>
            <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--gold-light)" }}>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white" style={{ backgroundColor: "var(--navy)" }}>
                    <th className="px-2 py-1.5 text-left font-semibold whitespace-nowrap">순</th>
                    <th className="px-2 py-1.5 text-left font-semibold whitespace-nowrap">순장</th>
                    <th className="px-2 py-1.5 text-center font-semibold whitespace-nowrap">출석</th>
                    <th className="px-2 py-1.5 text-left font-semibold whitespace-nowrap">장소</th>
                    <th className="px-2 py-1.5 text-left font-semibold whitespace-nowrap">인도</th>
                    <th className="px-2 py-1.5 text-left font-semibold whitespace-nowrap">성경/찬송</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item, idx) => {
                    const { num } = parseGroupName(item.group_name);
                    const n = parseNotes(item.notes);
                    return (
                      <tr
                        key={idx}
                        style={{ backgroundColor: idx % 2 === 0 ? "var(--cream)" : "white" }}
                      >
                        <td className="px-2 py-1.5 text-gray-500 whitespace-nowrap">{num}순</td>
                        <td className="px-2 py-1.5 font-medium text-gray-800 whitespace-nowrap">
                          {n["순장"] ?? "—"}
                        </td>
                        <td
                          className="px-2 py-1.5 text-center font-bold whitespace-nowrap"
                          style={{ color: "var(--navy)" }}
                        >
                          {item.total_attendance ?? "—"}
                        </td>
                        <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">
                          {n["장소"] ?? "—"}
                        </td>
                        <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">
                          {n["인도"] ?? "—"}
                        </td>
                        <td className="px-2 py-1.5 text-gray-600 whitespace-nowrap">
                          {n["성경"] ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
