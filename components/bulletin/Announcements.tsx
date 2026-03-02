import { Announcement } from "@/types/bulletin";

interface Props {
  items: Announcement[];
}

export default function Announcements({ items }: Props) {
  return (
    <section>
      <h2 className="section-title">이번 주 광고</h2>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex gap-3 rounded-lg px-4 py-3 text-sm"
            style={{ backgroundColor: "var(--cream)", border: "1px solid var(--gold-light)" }}
          >
            <span
              className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
              style={{ backgroundColor: "var(--navy)" }}
            >
              {item.id}
            </span>
            <div>
              <p
                className="text-xs font-bold mb-0.5"
                style={{ color: "var(--navy)", fontFamily: "var(--font-serif), serif" }}
              >
                {item.title}
              </p>
              <p className="text-xs text-gray-600 leading-5">{item.content}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
