import { BulletinData } from "@/types/bulletin";

interface Props {
  weeklyWord: BulletinData["weeklyWord"];
}

export default function WeeklyWord({ weeklyWord }: Props) {
  return (
    <section>
      <h2 className="section-title">이번 주 말씀</h2>
      <div
        className="rounded-lg p-5 relative overflow-hidden"
        style={{ backgroundColor: "var(--cream)", border: "1px solid var(--gold-light)" }}
      >
        {/* 장식 따옴표 */}
        <div
          className="absolute top-2 left-3 text-5xl leading-none select-none opacity-15"
          style={{ color: "var(--gold)", fontFamily: "Georgia, serif" }}
        >
          "
        </div>

        <p
          className="relative text-sm font-semibold leading-7 mb-2 pl-2"
          style={{ color: "var(--navy)", fontFamily: "var(--font-serif), serif" }}
        >
          {weeklyWord.verse}
        </p>
        <p
          className="text-xs font-bold mb-3 text-right"
          style={{ color: "var(--gold-text)" }}
        >
          — {weeklyWord.reference}
        </p>

        {/* 구분선 */}
        <div
          className="h-px mb-3"
          style={{ background: "linear-gradient(to right, var(--gold-light), transparent)" }}
        />

        <p className="text-xs text-gray-600 leading-6">{weeklyWord.content}</p>
      </div>
    </section>
  );
}
