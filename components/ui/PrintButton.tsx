"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      title="브라우저 인쇄 기능으로 PDF 저장이 가능합니다"
      className="rounded bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 transition-colors"
    >
      <span aria-hidden="true">🖨️</span> 인쇄 / PDF 저장
    </button>
  );
}
