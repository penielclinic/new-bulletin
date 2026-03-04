"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense } from "react";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(year: number, month: number, day: number) {
  const m = String(month + 1).padStart(2, "0");
  const d = String(day).padStart(2, "0");
  return `${year}-${m}-${d}`;
}

function CalendarContent() {
  const router = useRouter();

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // 업로드 모달 상태
  const [uploadDate, setUploadDate] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadMsg, setUploadMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/bulletin/dates")
      .then((r) => r.json())
      .then((dates: string[]) => {
        setAvailableDates(new Set(dates));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  async function handleUpload(file: File) {
    setUploadStatus("uploading");
    setUploadMsg("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/upload-bulletin", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "업로드 실패");
      setUploadStatus("done");
      setUploadMsg(`${json.date} 주보 업로드 완료!`);
      setAvailableDates(prev => new Set([...prev, json.date]));
    } catch (e) {
      setUploadStatus("error");
      setUploadMsg(e instanceof Error ? e.message : "오류가 발생했습니다.");
    }
  }

  function closeModal() {
    setUploadDate(null);
    setUploadStatus("idle");
    setUploadMsg("");
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const cells: Array<number | null> = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = `${year}년 ${month + 1}월`;

  return (
    <div className="min-h-screen" style={{ background: "var(--cream, #f9f6f0)" }}>
      {/* 상단 바 */}
      <div
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-2 shadow-sm border-b"
        style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(8px)", borderColor: "var(--gold-light, #e8d8a0)" }}
      >
        <Link
          href="/"
          className="rounded border px-4 py-1.5 text-xs font-semibold transition-colors"
          style={{ borderColor: "var(--navy, #1b3252)", color: "var(--navy, #1b3252)" }}
        >
          ← 주보로 돌아가기
        </Link>
        <span className="text-xs font-semibold" style={{ color: "var(--navy, #1b3252)" }}>
          주보 달력
        </span>
      </div>

      <main className="mx-auto max-w-lg px-4 py-8">
        <div
          className="rounded-xl bg-white overflow-hidden"
          style={{
            boxShadow: "0 4px 32px rgba(27,50,82,0.10), 0 1px 4px rgba(184,150,62,0.08)",
            border: "1px solid var(--gold-light, #e8d8a0)",
          }}
        >
          {/* 월 네비게이션 */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ background: "var(--navy, #1b3252)", color: "#fff" }}
          >
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-lg" aria-label="이전 달">‹</button>
            <span className="font-bold text-base tracking-wide">{monthLabel}</span>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-lg" aria-label="다음 달">›</button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b" style={{ borderColor: "var(--gold-light, #e8d8a0)" }}>
            {DAYS.map((d, i) => (
              <div
                key={d}
                className="py-2 text-center text-xs font-semibold"
                style={{
                  color: i === 0 ? "#b91c1c" : i === 6 ? "#1d4ed8" : "var(--navy, #1b3252)",
                  background: "var(--cream, #f9f6f0)",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          {loading ? (
            <div className="py-16 text-center text-sm text-gray-400">불러오는 중...</div>
          ) : (
            <div className="grid grid-cols-7">
              {cells.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} className="aspect-square" />;

                const dateStr = toDateStr(year, month, day);
                const hasData = availableDates.has(dateStr);
                const dow = (firstDay + day - 1) % 7;
                const isSunday = dow === 0;
                const isSaturday = dow === 6;

                if (hasData) {
                  return (
                    <Link
                      key={dateStr}
                      href={`/?date=${dateStr}`}
                      className="aspect-square flex flex-col items-center justify-center transition-opacity hover:opacity-80"
                      style={{
                        background: "var(--navy, #1b3252)",
                        color: "#fff",
                        margin: "3px",
                        borderRadius: "6px",
                      }}
                      title={`${dateStr} 주보 보기`}
                    >
                      <span className="text-sm font-bold">{day}</span>
                      <span className="text-[9px] opacity-80 mt-0.5">주보</span>
                    </Link>
                  );
                }

                return (
                  <button
                    key={dateStr}
                    onClick={() => { setUploadDate(dateStr); setUploadStatus("idle"); setUploadMsg(""); }}
                    className="aspect-square flex flex-col items-center justify-center transition-colors hover:bg-amber-50 group"
                    title={`${dateStr} 주보 업로드`}
                  >
                    <span className="text-sm" style={{ color: isSunday ? "#fca5a5" : isSaturday ? "#93c5fd" : "#d1d5db" }}>{day}</span>
                    <span className="text-[8px] text-amber-300 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">업로드</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 범례 */}
          <div
            className="flex items-center gap-4 px-6 py-3 text-xs border-t"
            style={{ borderColor: "var(--gold-light, #e8d8a0)", color: "#6b7280" }}
          >
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-4 rounded" style={{ background: "var(--navy, #1b3252)" }} />
              주보 있음
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-4 rounded bg-gray-200" />
              주보 없음 (클릭 → 업로드)
            </span>
          </div>
        </div>
      </main>

      {/* 업로드 모달 */}
      {uploadDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold" style={{ color: "var(--navy)" }}>{uploadDate} 주보 업로드</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>

            {uploadStatus === "idle" && (
              <>
                <p className="text-xs text-gray-500">주보 PDF 파일을 선택하면 AI가 자동으로 분석하여 저장합니다.</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors"
                  style={{ background: "var(--navy)" }}
                >
                  📄 PDF 파일 선택
                </button>
              </>
            )}

            {uploadStatus === "uploading" && (
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                <p className="text-sm text-amber-700 font-medium">AI가 주보를 분석하는 중...</p>
                <p className="text-xs text-gray-400">30~60초 소요될 수 있습니다</p>
              </div>
            )}

            {uploadStatus === "done" && (
              <div className="flex flex-col items-center gap-3 py-2">
                <span className="text-4xl">✅</span>
                <p className="text-sm font-semibold text-green-700">{uploadMsg}</p>
                <button
                  onClick={() => router.push(`/?date=${uploadDate}`)}
                  className="w-full rounded-lg py-2 text-sm font-semibold text-white"
                  style={{ background: "var(--navy)" }}
                >
                  주보 보기
                </button>
                <button onClick={closeModal} className="text-xs text-gray-400 hover:text-gray-600">닫기</button>
              </div>
            )}

            {uploadStatus === "error" && (
              <div className="flex flex-col items-center gap-3 py-2">
                <span className="text-4xl">❌</span>
                <p className="text-sm text-red-600 text-center">{uploadMsg}</p>
                <button
                  onClick={() => setUploadStatus("idle")}
                  className="w-full rounded-lg py-2 text-sm font-semibold text-white bg-red-500"
                >
                  다시 시도
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--cream, #f9f6f0)" }} />}>
      <CalendarContent />
    </Suspense>
  );
}
