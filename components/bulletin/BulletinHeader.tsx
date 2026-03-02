import { BulletinData, SERVICE_TYPE_LABELS } from "@/types/bulletin";

interface Props {
  church: BulletinData["church"];
  service: BulletinData["service"];
  motto: BulletinData["motto"];
}

export default function BulletinHeader({ church, service, motto }: Props) {
  return (
    <header className="mb-8 print:mb-6">
      {/* 최상단 네이비 배너 */}
      <div
        className="rounded-t-lg py-4 px-6 text-center print:rounded-none"
        style={{ backgroundColor: "var(--navy)" }}
      >
        {/* 십자가 */}
        <div className="text-2xl mb-1" style={{ color: "var(--gold-light)" }}>
          ✝
        </div>
        <h1
          className="text-3xl font-black tracking-tight text-white print:text-2xl"
          style={{ fontFamily: "var(--font-serif), serif" }}
        >
          {church.name}
        </h1>
        <p className="mt-1 text-xs tracking-widest" style={{ color: "var(--gold-light)" }}>
          {church.pastor}
        </p>
      </div>

      {/* 금색 구분선 */}
      <div
        className="h-1"
        style={{
          background: `linear-gradient(to right, var(--navy), var(--gold), var(--navy))`,
        }}
      />

      {/* 표어 띠 */}
      <div
        className="py-2 text-center text-sm tracking-wider"
        style={{ backgroundColor: "var(--cream)", color: "var(--navy)" }}
      >
        <span className="font-semibold">{motto.year}년 표어</span>
        &emsp;❝ {motto.text} ❞&emsp;
        <span className="opacity-60">({motto.scripture})</span>
      </div>

      {/* 금색 구분선 */}
      <div
        className="h-px"
        style={{ background: "linear-gradient(to right, transparent, var(--gold), transparent)" }}
      />

      {/* 이번 주 예배 정보 */}
      <div
        className="rounded-b-lg px-6 py-5 text-center print:rounded-none"
        style={{ backgroundColor: "var(--cream)" }}
      >
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <p
            className="text-xs tracking-widest font-medium"
            style={{ color: "var(--gold-text)" }}
          >
            {service.date}
          </p>
          {service.serviceType && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "var(--navy)", color: "var(--gold-light)" }}
            >
              {SERVICE_TYPE_LABELS[service.serviceType] ?? service.serviceType}
            </span>
          )}
        </div>
        <p
          className="text-xl font-bold leading-snug mb-2 print:text-lg"
          style={{ color: "var(--navy)", fontFamily: "var(--font-serif), serif" }}
        >
          {service.title}
        </p>
        {/* 장식 구분선 */}
        <div className="flex items-center justify-center gap-3 mb-1.5">
          <span className="h-px w-12" style={{ background: "var(--gold)" }} />
          <span className="text-xs" style={{ color: "var(--gold)" }}>✦</span>
          <span className="h-px w-12" style={{ background: "var(--gold)" }} />
        </div>
        <p className="text-sm" style={{ color: "#5a4a35" }}>
          {service.scripture}&nbsp;&nbsp;|&nbsp;&nbsp;{service.preacher}
        </p>
      </div>
    </header>
  );
}
