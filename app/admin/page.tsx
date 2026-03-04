"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BulletinData } from "@/types/bulletin";
import { loadBulletin, saveBulletin, resetBulletin } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import ServiceInfoEditor from "@/components/admin/ServiceInfoEditor";
import WorshipOrderEditor from "@/components/admin/WorshipOrderEditor";
import AnnouncementsEditor from "@/components/admin/AnnouncementsEditor";
import WeeklyWordEditor from "@/components/admin/WeeklyWordEditor";
import ScheduleEditor from "@/components/admin/ScheduleEditor";
import ImageBulletinParser from "@/components/admin/ImageBulletinParser";
import AllWorshipOrdersEditor from "@/components/admin/AllWorshipOrdersEditor";
import WorshipCommitteeEditor from "@/components/admin/WorshipCommitteeEditor";
import SqlGenerator from "@/components/admin/SqlGenerator";
import PdfSqlExporter from "@/components/admin/PdfSqlExporter";

const TABS = [
  { id: "service", label: "기본 정보" },
  { id: "allworship", label: "예배순서 (4종)" },
  { id: "committee", label: "예배위원" },
  { id: "announcements", label: "광고" },
  { id: "word", label: "이번 주 말씀" },
  { id: "schedule", label: "교회 일정" },
  { id: "sql", label: "SQL 내보내기" },
  { id: "pdfsql", label: "PDF → SQL" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function parseBulletinDate(dateStr: string): string {
  const m = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (!m) return "";
  const [, y, mo, d] = m;
  return `${y}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function AdminContent() {
  const [data, setData] = useState<BulletinData | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("service");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "ok" | "error">("idle");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date") ?? undefined;

  useEffect(() => {
    loadBulletin(dateParam).then(setData);
  }, [dateParam]);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("bulletin_date")
      .order("bulletin_date", { ascending: false })
      .then(({ data: rows }) => {
        if (!rows) return;
        const unique = [...new Set(rows.map((r) => r.bulletin_date as string))];
        setAvailableDates(unique);
      });
  }, []);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400 text-sm">
        불러오는 중...
      </div>
    );
  }

  async function handleSave() {
    if (!data || saving) return;
    setSaving(true);
    const ok = await saveBulletin(data);
    setSaving(false);
    setSaveStatus(ok ? "ok" : "error");
    setTimeout(() => setSaveStatus("idle"), 2500);
  }

  async function handleReset() {
    if (!confirm("샘플 기본값으로 초기화하시겠습니까?")) return;
    await resetBulletin();
    const fresh = await loadBulletin();
    setData(fresh);
  }

  function updateServiceField(
    key: "church" | "service" | "motto",
    field: string,
    value: string | number
  ) {
    setData((prev) =>
      prev ? { ...prev, [key]: { ...prev[key], [field]: value } } : prev
    );
  }

  const saveLabel =
    saving ? "저장 중..." : saveStatus === "ok" ? "✓ 저장됨" : saveStatus === "error" ? "✕ 오류" : "저장";
  const saveCls =
    saving || saveStatus === "idle"
      ? "bg-amber-700 hover:bg-amber-800"
      : saveStatus === "ok"
      ? "bg-green-600"
      : "bg-red-500";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto max-w-4xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              ← 주보 보기
            </Link>
            <h1 className="text-base font-bold text-gray-900">주보 관리자</h1>
            {availableDates.length > 0 && (
              <select
                value={dateParam ?? availableDates[0]}
                onChange={(e) => router.push(`/admin?date=${e.target.value}`)}
                className="rounded border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                {availableDates.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/admin/login");
              }}
              className="rounded border border-gray-200 px-4 py-1.5 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              로그아웃
            </button>
            <button
              onClick={handleReset}
              className="rounded border border-gray-200 px-4 py-1.5 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
            >
              초기화
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`rounded px-5 py-1.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${saveCls}`}
            >
              {saveLabel}
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div className="mx-auto max-w-4xl px-6 flex gap-1 border-t border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-amber-700 text-amber-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* 편집 영역 */}
      <main className="mx-auto max-w-4xl px-6 py-6">
        <ImageBulletinParser onParsed={(parsed) => setData(parsed)} />
        <div className="rounded-lg bg-white shadow-sm border border-gray-100 p-6">
          {activeTab === "service" && (
            <ServiceInfoEditor
              church={data.church}
              service={data.service}
              motto={data.motto}
              onChange={updateServiceField}
            />
          )}
          {activeTab === "allworship" && <AllWorshipOrdersEditor />}
          {activeTab === "committee" && (
            <WorshipCommitteeEditor bulletinDate={parseBulletinDate(data.service.date)} />
          )}
          {activeTab === "announcements" && (
            <AnnouncementsEditor
              items={data.announcements}
              onChange={(items) => setData({ ...data, announcements: items })}
            />
          )}
          {activeTab === "word" && (
            <WeeklyWordEditor
              weeklyWord={data.weeklyWord}
              onChange={(field, value) =>
                setData({ ...data, weeklyWord: { ...data.weeklyWord, [field]: value } })
              }
            />
          )}
          {activeTab === "schedule" && (
            <ScheduleEditor
              items={data.schedule}
              onChange={(items) => setData({ ...data, schedule: items })}
            />
          )}
          {activeTab === "sql" && (
            <SqlGenerator bulletinDate={parseBulletinDate(data.service.date)} />
          )}
          {activeTab === "pdfsql" && <PdfSqlExporter />}
        </div>

        <p className="mt-3 text-center text-xs text-gray-400">
          예배순서·예배위원 탭의 저장은 Supabase에 직접 반영됩니다.
        </p>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400 text-sm">불러오는 중...</div>}>
      <AdminContent />
    </Suspense>
  );
}
