import { WorshipItem } from "@/types/bulletin";

interface Props {
  items: WorshipItem[];
  serviceTypeName?: string;
}

export default function WorshipOrder({ items, serviceTypeName }: Props) {
  return (
    <section>
      <h2 className="section-title">{serviceTypeName ?? "예배순서"}</h2>
      <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--gold-light)" }}>
        {items.length === 0 ? (
          <p className="px-4 py-3 text-xs text-gray-400 text-center">순서 없음</p>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.order}
              className="flex items-start gap-2 px-3 py-1.5 text-xs"
              style={{
                backgroundColor: idx % 2 === 0 ? "var(--cream)" : "white",
              }}
            >
              <span
                className="w-3.5 text-right font-bold shrink-0 pt-px"
                style={{ color: "var(--gold-text)", fontSize: "0.75rem" }}
              >
                {item.order}
              </span>
              <span
                className="w-20 font-semibold shrink-0 leading-5"
                style={{ color: "var(--navy)", fontFamily: "var(--font-serif), serif", fontSize: "0.75rem", letterSpacing: "0.05em" }}
              >
                {item.title}
              </span>
              <div className="leading-5 text-gray-600 min-w-0" style={{ fontSize: "0.75rem" }}>
                {item.detail}
                {item.note && (
                  <span className="ml-1 text-gray-400">— {item.note}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
