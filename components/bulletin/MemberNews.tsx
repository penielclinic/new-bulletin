import { MemberNewsItem } from "@/types/bulletin";

interface Props {
  items: MemberNewsItem[];
}

const TYPE_LABEL: Record<string, string> = {
  "환영": "새가족",
  "축하-득남": "득남",
  "축하-득녀": "득녀",
  "성경통독": "성경통독",
};

export default function MemberNews({ items }: Props) {
  const grouped = items.reduce<Record<string, MemberNewsItem[]>>((acc, item) => {
    const key = item.news_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <section>
      <h2 className="section-title">교우소식</h2>
      <div className="space-y-2">
        {Object.entries(grouped).map(([type, list]) => (
          {list.map((item, idx) => (
            <div key={idx} className="flex items-baseline gap-2 rounded-lg px-4 py-2.5 text-xs" style={{ backgroundColor: "var(--cream)", border: "1px solid var(--gold-light)" }}>
              <span className="font-bold shrink-0" style={{ color: "var(--gold-text)" }}>
                {TYPE_LABEL[type] ?? type}
              </span>
              <span className="text-gray-700 whitespace-nowrap">
                {item.member_name}
                {item.detail && <span className="text-gray-400 ml-1">({item.detail})</span>}
              </span>
            </div>
          ))}
        ))}
      </div>
    </section>
  );
}
