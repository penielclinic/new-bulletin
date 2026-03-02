"use client";

import { useRef, useState } from "react";

interface WorshipItem {
  order: number;
  title: string;
  detail: string | null;
  note: string | null;
}

interface CommitteeItem {
  week_type: string;
  service_date: string;
  role_type: string;
  service_part: string | null;
  member_name: string;
}

interface ParsedData {
  bulletinDate: string;
  allWorshipOrders: { serviceType: string; items: WorshipItem[] }[];
  worshipCommittee: CommitteeItem[];
  announcements: { order: number; title: string; content: string }[];
  weeklyWord: { verse: string; reference: string; content: string };
  schedule: { date_label: string; day_of_week: string; time: string; title: string; location: string | null }[];
}

function escape(v: string | null | undefined): string {
  if (v == null || v === "") return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}

function generateSql(d: ParsedData): string {
  const bd = d.bulletinDate;
  const lines: string[] = [
    `-- ============================================================`,
    `-- ${bd} 주보 업데이트 (AI 자동 생성)`,
    `-- ============================================================`,
    "",
  ];

  // STEP 2~3: 예배순서
  lines.push("-- STEP 2: 예배순서 삭제", "DELETE FROM worship_orders;", "");
  const worshipRows: string[] = [];
  (d.allWorshipOrders ?? []).forEach(({ serviceType, items }) => {
    (items ?? []).forEach((item) => {
      worshipRows.push(
        `  (${escape(serviceType)}, ${item.order}, ${escape(item.title)}, ${escape(item.detail)}, ${escape(item.note)})`
      );
    });
  });
  if (worshipRows.length > 0) {
    lines.push("-- STEP 3: 예배순서 입력");
    lines.push("INSERT INTO worship_orders (worship_type, order_number, order_name, detail, leader) VALUES");
    lines.push(worshipRows.join(",\n") + ";");
  } else {
    lines.push("-- STEP 3: 예배순서 데이터 없음");
  }
  lines.push("");

  // STEP 4: 예배위원
  lines.push(`-- STEP 4: 예배위원 삭제 (${bd})`, `DELETE FROM worship_committee WHERE bulletin_date = '${bd}';`, "");
  const commRows = (d.worshipCommittee ?? []).map((item) => {
    const sd = item.service_date ? item.service_date.slice(0, 10) : null;
    return `  ('${bd}', ${escape(item.week_type)}, ${escape(sd)}, ${escape(item.role_type)}, ${escape(item.service_part || null)}, ${escape(item.member_name)})`;
  });
  if (commRows.length > 0) {
    lines.push("-- STEP 4: 예배위원 입력");
    lines.push("INSERT INTO worship_committee (bulletin_date, week_type, service_date, role_type, service_part, member_name) VALUES");
    lines.push(commRows.join(",\n") + ";");
  } else {
    lines.push("-- STEP 4: 예배위원 데이터 없음");
  }
  lines.push("");

  // STEP 5: 이번 주 말씀
  lines.push(`-- STEP 5: 이번 주 말씀`, `DELETE FROM weekly_word WHERE bulletin_date = '${bd}';`);
  if (d.weeklyWord?.verse) {
    lines.push("INSERT INTO weekly_word (bulletin_date, verse, reference, content) VALUES");
    lines.push(`  ('${bd}', ${escape(d.weeklyWord.verse)}, ${escape(d.weeklyWord.reference)}, ${escape(d.weeklyWord.content)});`);
  }
  lines.push("");

  // STEP 6: 광고
  lines.push(`-- STEP 6: 광고`, `DELETE FROM announcements WHERE bulletin_date = '${bd}';`);
  const annoRows = (d.announcements ?? []).map((a) =>
    `  ('${bd}', ${a.order}, NULL, ${escape(a.title)}, ${escape(a.content)})`
  );
  if (annoRows.length > 0) {
    lines.push("INSERT INTO announcements (bulletin_date, order_number, category, title, content) VALUES");
    lines.push(annoRows.join(",\n") + ";");
  }
  lines.push("");

  // STEP 7: 교회 일정
  lines.push(`-- STEP 7: 교회 일정`, `DELETE FROM weekly_schedule WHERE bulletin_date = '${bd}';`);
  const schedRows = (d.schedule ?? []).map((s, i) =>
    `  ('${bd}', ${i + 1}, ${escape(s.date_label)}, ${escape(s.day_of_week)}, ${escape(s.time)}, ${escape(s.title)}, ${escape(s.location)})`
  );
  if (schedRows.length > 0) {
    lines.push("INSERT INTO weekly_schedule (bulletin_date, sort_order, date_label, day_of_week, time, title, location) VALUES");
    lines.push(schedRows.join(",\n") + ";");
  }
  lines.push("");

  // STEP 8: 확인
  lines.push(
    "-- STEP 8: 확인 조회",
    "SELECT worship_type, COUNT(*) as 항목수 FROM worship_orders GROUP BY worship_type;",
    `SELECT COUNT(*) as 예배위원수 FROM worship_committee WHERE bulletin_date = '${bd}';`,
    `SELECT COUNT(*) as 광고수 FROM announcements WHERE bulletin_date = '${bd}';`,
    `SELECT bulletin_date, reference FROM weekly_word WHERE bulletin_date = '${bd}';`,
    `SELECT COUNT(*) as 일정수 FROM weekly_schedule WHERE bulletin_date = '${bd}';`
  );

  return lines.join("\n");
}

export default function PdfSqlExporter() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [sql, setSql] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleFile(file: File) {
    setFileName(file.name);
    setStatus("loading");
    setErrorMsg("");
    setParsed(null);
    setSql("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse-bulletin-sql", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "알 수 없는 오류");

      const data: ParsedData = json.data;
      const generatedSql = generateSql(data);
      setParsed(data);
      setSql(generatedSql);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setStatus("error");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function copy() {
    navigator.clipboard.writeText(sql).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-5">
      <p className="text-xs text-gray-500">
        주보 PDF 또는 이미지를 업로드하면 AI가 분석하여 Supabase용 SQL을 자동 생성합니다.
      </p>

      {/* 업로드 영역 */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => status !== "loading" && inputRef.current?.click()}
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer
          ${status === "loading"
            ? "border-amber-300 bg-amber-50 cursor-wait"
            : "border-gray-200 hover:border-amber-400 hover:bg-amber-50/40"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          className="hidden"
          onChange={handleChange}
        />

        {status === "loading" ? (
          <>
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
            <p className="text-sm text-amber-700 font-medium">AI가 주보를 분석하는 중...</p>
            <p className="text-xs text-gray-400">{fileName}</p>
          </>
        ) : status === "done" ? (
          <>
            <span className="text-3xl">✓</span>
            <p className="text-sm text-green-700 font-medium">분석 완료 — SQL이 생성되었습니다</p>
            <p className="text-xs text-gray-400">{fileName} · 다른 파일을 올리려면 클릭하세요</p>
          </>
        ) : (
          <>
            <span className="text-4xl text-gray-300">📄</span>
            <p className="text-sm font-medium text-gray-600">주보 PDF 또는 이미지를 업로드하세요</p>
            <p className="text-xs text-gray-400">클릭하거나 파일을 드래그하세요 (PDF, JPG, PNG)</p>
          </>
        )}

        {status === "error" && (
          <p className="mt-1 rounded bg-red-50 px-3 py-1.5 text-xs text-red-600 font-medium">{errorMsg}</p>
        )}
      </div>

      {/* 파싱 결과 요약 */}
      {parsed && (
        <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-xs text-gray-600 space-y-1">
          <p className="font-bold text-gray-700 mb-1">추출 결과 — {parsed.bulletinDate}</p>
          {parsed.allWorshipOrders?.map(({ serviceType, items }) => (
            <p key={serviceType}>· {serviceType}: {items?.length ?? 0}개 순서</p>
          ))}
          <p>· 예배위원: {parsed.worshipCommittee?.length ?? 0}개 행</p>
          <p>· 광고: {parsed.announcements?.length ?? 0}개</p>
          <p>· 교회 일정: {parsed.schedule?.length ?? 0}개</p>
          <p>· 이번 주 말씀: {parsed.weeklyWord?.reference ?? "없음"}</p>
        </div>
      )}

      {/* SQL 출력 */}
      {sql && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-700">생성된 SQL</h3>
            <button
              onClick={copy}
              className={`px-3 py-1 text-xs rounded font-medium transition-colors ${
                copied ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-600"
              }`}
            >
              {copied ? "✓ 복사됨" : "복사"}
            </button>
          </div>
          <pre className="rounded bg-gray-900 text-green-300 p-4 text-xs overflow-x-auto whitespace-pre leading-5 max-h-96 overflow-y-auto">
            {sql}
          </pre>
        </div>
      )}
    </div>
  );
}
