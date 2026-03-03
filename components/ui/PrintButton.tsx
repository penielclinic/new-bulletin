"use client";

export default function PrintButton() {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => window.print()}
        title="인쇄"
        className="flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all hover:shadow-sm"
        style={{ background: "var(--cream)", color: "var(--navy)", border: "1px solid var(--gold-light)" }}
      >
        <span aria-hidden="true" style={{ fontSize: "0.7rem" }}>🖨️</span> 인쇄
      </button>
      <button
        onClick={() => window.print()}
        title="PDF로 저장 (인쇄 화면에서 PDF 선택)"
        className="flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white transition-all hover:shadow-md"
        style={{ background: "linear-gradient(135deg, var(--navy) 0%, #2d5090 100%)" }}
      >
        <span aria-hidden="true" style={{ fontSize: "0.7rem" }}>📥</span> PDF 저장
      </button>
    </div>
  );
}
