"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const selectedDate = searchParams.get("selected") ?? undefined;

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

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

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  // Build calendar grid (6 weeks max)
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
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-lg"
              aria-label="이전 달"
            >
              ‹
            </button>
            <span className="font-bold text-base tracking-wide">{monthLabel}</span>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-lg"
              aria-label="다음 달"
            >
              ›
            </button>
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
                if (day === null) {
                  return <div key={`empty-${idx}`} className="aspect-square" />;
                }
                const dateStr = toDateStr(year, month, day);
                const hasData = availableDates.has(dateStr);
                const isSelected = dateStr === selectedDate;
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
                        background: isSelected ? "var(--gold, #b8963e)" : "var(--navy, #1b3252)",
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
                  <div
                    key={dateStr}
                    className="aspect-square flex items-center justify-center"
                    style={{
                      color: isSunday ? "#fca5a5" : isSaturday ? "#93c5fd" : "#d1d5db",
                    }}
                  >
                    <span className="text-sm">{day}</span>
                  </div>
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
              <span
                className="inline-block w-4 h-4 rounded"
                style={{ background: "var(--navy, #1b3252)" }}
              />
              주보 있음
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-4 rounded bg-gray-200" />
              주보 없음
            </span>
          </div>
        </div>
      </main>
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
