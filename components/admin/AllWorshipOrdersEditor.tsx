"use client";

import { useState, useEffect } from "react";
import { SERVICE_TYPES, SERVICE_TYPE_LABELS, ServiceType, WorshipItem } from "@/types/bulletin";
import WorshipOrderEditor from "./WorshipOrderEditor";

export default function AllWorshipOrdersEditor() {
  const [activeType, setActiveType] = useState<ServiceType>(SERVICE_TYPES[0]);
  const [allOrders, setAllOrders] = useState<Record<ServiceType, WorshipItem[]>>(
    () =>
      SERVICE_TYPES.reduce(
        (acc, t) => ({ ...acc, [t]: [] }),
        {} as Record<ServiceType, WorshipItem[]>
      )
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  useEffect(() => {
    fetch("/api/worship-orders")
      .then((r) => r.json())
      .then((data) => {
        setAllOrders((prev) => ({ ...prev, ...data }));
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/worship-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(allOrders),
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

  return (
    <div className="space-y-4">
      {/* 서브탭 */}
      <div className="flex gap-1 border-b border-gray-200">
        {SERVICE_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeType === t
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            {SERVICE_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      {/* 편집기 */}
      <p className="text-xs text-gray-400">▲▼ 순서 변경, ✕ 삭제 가능</p>
      <WorshipOrderEditor
        items={allOrders[activeType]}
        onChange={(items) => setAllOrders((prev) => ({ ...prev, [activeType]: items }))}
      />

      {/* 저장 버튼 */}
      <div className="flex justify-end pt-2">
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
