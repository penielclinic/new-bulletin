"use client";

import { useState, useEffect } from "react";
import { WorshipCommitteeItem } from "@/types/bulletin";

const ROLE_TYPES = ["예배위원(선교회)", "사회", "기도인도", "헌금위원", "정문", "3층", "실내", "중층", "중식"];
const PART_OPTIONS = ["", "1부", "2부"];

interface Props {
  bulletinDate: string;
}

export default function WorshipCommitteeEditor({ bulletinDate }: Props) {
  const [items, setItems] = useState<WorshipCommitteeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  useEffect(() => {
    if (!bulletinDate) return;
    setLoading(true);
    fetch(`/api/worship-committee?date=${bulletinDate}`)
      .then((r) => r.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, [bulletinDate]);

  function update(idx: number, field: keyof WorshipCommitteeItem, value: string) {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  }

  function add(weekType: "금주" | "차주") {
    const serviceDate = weekType === "금주" ? bulletinDate : "";
    setItems((prev) => [
      ...prev,
      { week_type: weekType, service_date: serviceDate, role_type: "사회", service_part: "1부", member_name: "" },
    ]);
  }

  function remove(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/worship-committee", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bulletinDate, items }),
    });
    setSaving(false);
    setStatus(res.ok ? "ok" : "error");
    setTimeout(() => setStatus("idle"), 2500);
  }

  const saveLabel =
    saving ? "저장 중..." : status === "ok" ? "✓ 저장됨" : status === "error" ? "✕ 오류" : "Supabase에 저장";
  const saveCls =
    saving || status === "idle"
      ? "bg-amber-700 hover:bg-amber-800"
      : status === "ok"
      ? "bg-green-600"
      : "bg-red-500";

  if (loading) return <p className="text-sm text-gray-400 py-4 text-center">불러오는 중...</p>;

  const thisWeek = items.map((item, idx) => ({ item, idx })).filter(({ item }) => item.week_type === "금주");
  const nextWeek = items.map((item, idx) => ({ item, idx })).filter(({ item }) => item.week_type === "차주");

  function renderTable(group: { item: WorshipCommitteeItem; idx: number }[], weekType: "금주" | "차주") {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${weekType === "금주" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>
            {weekType === "금주" ? `금주 (${bulletinDate})` : "차주"}
          </span>
          <button onClick={() => add(weekType)} className="text-xs text-amber-600 hover:underline">
            + 행 추가
          </button>
        </div>
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2 text-left font-semibold text-gray-600 w-36">역할</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600 w-16">부</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-600">이름 (공백 구분)</th>
                <th className="px-2 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {group.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-4 text-center text-gray-400">항목 없음</td>
                </tr>
              ) : (
                group.map(({ item, idx }) => (
                  <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-amber-50/30">
                    <td className="px-2 py-1.5">
                      <select
                        value={item.role_type}
                        onChange={(e) => update(idx, "role_type", e.target.value)}
                        className="w-full rounded border border-gray-200 px-1.5 py-1 text-xs focus:border-amber-500 focus:outline-none bg-white"
                      >
                        {ROLE_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <select
                        value={item.service_part ?? ""}
                        onChange={(e) => update(idx, "service_part", e.target.value)}
                        className="w-full rounded border border-gray-200 px-1.5 py-1 text-xs focus:border-amber-500 focus:outline-none bg-white"
                      >
                        {PART_OPTIONS.map((p) => <option key={p} value={p}>{p || "—"}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1.5">
                      <input
                        value={item.member_name}
                        onChange={(e) => update(idx, "member_name", e.target.value)}
                        placeholder="이름 입력"
                        className="w-full rounded border border-gray-200 px-2 py-1 text-xs focus:border-amber-500 focus:outline-none"
                      />
                    </td>
                    <td className="px-2 py-1.5 text-center">
                      <button
                        onClick={() => remove(idx)}
                        className="text-gray-300 hover:text-red-400 transition-colors text-sm leading-none"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-gray-400">
        주보 날짜 <strong>{bulletinDate}</strong> 기준 · 저장 시 해당 날짜 데이터를 덮어씁니다.
      </p>

      {renderTable(thisWeek, "금주")}
      {renderTable(nextWeek, "차주")}

      <div className="flex justify-end pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`rounded px-5 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${saveCls}`}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
