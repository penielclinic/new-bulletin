"use client";

import { useState, useEffect } from "react";
import { SERVICE_TYPES, ServiceType, WorshipItem, WorshipCommitteeItem } from "@/types/bulletin";

function escape(v: string | null | undefined): string {
  if (v == null) return "NULL";
  return `'${v.replace(/'/g, "''")}'`;
}

function genWorshipOrdersSql(bulletinDate: string, allOrders: Record<ServiceType, WorshipItem[]>): string {
  const rows: string[] = [];
  SERVICE_TYPES.forEach((t) => {
    (allOrders[t] ?? []).forEach((item) => {
      rows.push(
        `  ('${bulletinDate}', ${escape(t)}, ${item.order}, ${escape(item.title)}, ${escape(item.detail ?? null)}, ${escape(item.note ?? null)}, ${item.standing ? "TRUE" : "FALSE"})`
      );
    });
  });

  const lines = [`-- STEP 2: 예배순서 삭제 (${bulletinDate})`, `DELETE FROM worship_orders WHERE bulletin_date = '${bulletinDate}';`, ""];
  if (rows.length > 0) {
    lines.push("-- STEP 3: 예배순서 입력");
    lines.push("INSERT INTO worship_orders (bulletin_date, worship_type, order_number, order_name, detail, leader, standing) VALUES");
    lines.push(rows.join(",\n") + ";");
  } else {
    lines.push("-- STEP 3: 입력할 예배순서 데이터 없음");
  }
  return lines.join("\n");
}

function genCommitteeSql(bulletinDate: string, items: WorshipCommitteeItem[]): string {
  const lines = [
    `-- STEP 4: 예배위원 삭제 (${bulletinDate})`,
    `DELETE FROM worship_committee WHERE bulletin_date = '${bulletinDate}';`,
    "",
  ];

  if (items.length > 0) {
    const rows = items.map((item) => {
      const sd = item.service_date ? item.service_date.slice(0, 10) : null;
      return `  ('${bulletinDate}', ${escape(item.week_type)}, ${escape(sd)}, ${escape(item.role_type)}, ${escape(item.service_part ?? null)}, ${escape(item.member_name)})`;
    });
    lines.push("-- STEP 4: 예배위원 입력");
    lines.push("INSERT INTO worship_committee (bulletin_date, week_type, service_date, role_type, service_part, member_name) VALUES");
    lines.push(rows.join(",\n") + ";");
  } else {
    lines.push("-- STEP 4: 입력할 예배위원 데이터 없음");
  }
  return lines.join("\n");
}

interface Props {
  bulletinDate: string;
}

export default function SqlGenerator({ bulletinDate }: Props) {
  const [allOrders, setAllOrders] = useState<Record<ServiceType, WorshipItem[]>>(
    () =>
      SERVICE_TYPES.reduce(
        (acc, t) => ({ ...acc, [t]: [] }),
        {} as Record<ServiceType, WorshipItem[]>
      )
  );
  const [committee, setCommittee] = useState<WorshipCommitteeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<"orders" | "committee" | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/worship-orders").then((r) => r.json()),
      bulletinDate
        ? fetch(`/api/worship-committee?date=${bulletinDate}`).then((r) => r.json())
        : Promise.resolve([]),
    ]).then(([orders, comm]) => {
      setAllOrders((prev) => ({ ...prev, ...orders }));
      setCommittee(comm);
      setLoading(false);
    });
  }, [bulletinDate]);

  function copy(text: string, key: "orders" | "committee") {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  if (loading) return <p className="text-sm text-gray-400 py-4 text-center">불러오는 중...</p>;

  const ordersSql = genWorshipOrdersSql(bulletinDate, allOrders);
  const committeeSql = genCommitteeSql(bulletinDate, committee);

  return (
    <div className="space-y-6">
      <p className="text-xs text-gray-500">
        현재 Supabase에 저장된 데이터를 기반으로 SQL을 생성합니다. 복사 후 Supabase SQL Editor에서 실행하세요.
      </p>

      {/* 예배순서 SQL */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700">STEP 2~3: 예배순서</h3>
          <button
            onClick={() => copy(ordersSql, "orders")}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
              copied === "orders" ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            {copied === "orders" ? "✓ 복사됨" : "복사"}
          </button>
        </div>
        <pre className="rounded bg-gray-900 text-green-300 p-4 text-xs overflow-x-auto whitespace-pre leading-5 max-h-72 overflow-y-auto">
          {ordersSql}
        </pre>
      </div>

      {/* 예배위원 SQL */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700">STEP 4: 예배위원 ({bulletinDate})</h3>
          <button
            onClick={() => copy(committeeSql, "committee")}
            className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
              copied === "committee" ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
            }`}
          >
            {copied === "committee" ? "✓ 복사됨" : "복사"}
          </button>
        </div>
        <pre className="rounded bg-gray-900 text-green-300 p-4 text-xs overflow-x-auto whitespace-pre leading-5 max-h-72 overflow-y-auto">
          {committeeSql}
        </pre>
      </div>
    </div>
  );
}
