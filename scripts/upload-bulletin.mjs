import { readFileSync } from "fs";

const PDF_PATH = "C:/Users/penie/Desktop/주보/n_2026년 3월 1일(최종).pdf";
const API_URL = "http://localhost:3000/api/parse-bulletin-sql";
const SUPABASE_URL = "https://mjekoveqvrclfaebhuty.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qZWtvdmVxdnJjbGZhZWJodXR5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjA4Mzg3OSwiZXhwIjoyMDg3NjU5ODc5fQ.PHj2WTKwxyZXnU31Rnii2PFW-ZZCieRfGbHVgQXFtQ0";

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates",
};

async function upsert(table, rows) {
  if (!rows || rows.length === 0) { console.log(`  ${table}: 데이터 없음`); return; }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...headers, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(rows),
  });
  if (res.ok) console.log(`  ✓ ${table}: ${rows.length}건`);
  else console.error(`  ✗ ${table} 실패:`, await res.text());
}

async function deleteByDate(table, date) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?bulletin_date=eq.${date}`, {
    method: "DELETE",
    headers,
  });
  if (res.ok) console.log(`  삭제: ${table} (${date})`);
}

async function main() {
  // 1. PDF 파싱
  console.log("1. PDF 파싱 중...");
  const pdfBuffer = readFileSync(PDF_PATH);
  const form = new FormData();
  form.append("file", new Blob([pdfBuffer], { type: "application/pdf" }), "bulletin.pdf");

  const parseRes = await fetch(API_URL, { method: "POST", body: form });
  const parseJson = await parseRes.json();
  if (parseJson.error) { console.error("파싱 실패:", parseJson.error); process.exit(1); }

  const d = parseJson.data;
  const date = d.bulletinDate;
  console.log(`  날짜: ${date}`);
  console.log(`  예배순서: ${d.allWorshipOrders?.map(o => `${o.serviceType}(${o.items?.length})`).join(", ")}`);
  console.log(`  예배위원: ${d.worshipCommittee?.length}건`);
  console.log(`  광고: ${d.announcements?.length}건`);
  console.log(`  교회학교: ${d.schoolSermons?.length}건`);
  console.log(`  헌금: ${d.offeringDonors?.length}건`);
  console.log(`  선교회보고: ${d.missionWorshipReports?.length}건`);
  console.log(`  금식기도: ${d.fastingPrayer?.length}건`);

  // 2. 기존 데이터 삭제
  console.log("\n2. 기존 데이터 삭제...");
  for (const table of ["announcements", "worship_committee", "weekly_word", "weekly_schedule",
    "school_sermons", "offering_donors_raw", "mission_worship_report", "fasting_prayer"]) {
    await deleteByDate(table, date);
  }

  // 3. 예배순서 (bulletin_date + worship_type 기준)
  console.log("\n3. 데이터 업로드...");
  for (const wo of (d.allWorshipOrders ?? [])) {
    if (!wo.items?.length) continue;
    // 기존 삭제 (날짜+타입 기준)
    await fetch(`${SUPABASE_URL}/rest/v1/worship_orders?bulletin_date=eq.${date}&worship_type=eq.${encodeURIComponent(wo.serviceType)}`, {
      method: "DELETE", headers,
    });
    await upsert("worship_orders", wo.items.map(item => ({
      bulletin_date: date,
      worship_type: wo.serviceType,
      order_number: item.order,
      order_name: item.title,
      detail: item.detail ?? null,
      leader: item.note ?? null,
      standing: item.standing ?? false,
    })));
  }

  // 4. 예배위원
  await upsert("worship_committee", (d.worshipCommittee ?? []).map(r => ({
    bulletin_date: date,
    week_type: r.week_type,
    service_date: r.service_date,
    role_type: r.role_type,
    service_part: r.service_part ?? null,
    member_name: r.member_name,
  })));

  // 5. 광고
  await upsert("announcements", (d.announcements ?? []).map(r => ({
    bulletin_date: date,
    order_number: r.order,
    title: r.title,
    content: r.content,
  })));

  // 6. 이번주 말씀
  if (d.weeklyWord) {
    await upsert("weekly_word", [{ bulletin_date: date, verse: d.weeklyWord.verse, reference: d.weeklyWord.reference, content: d.weeklyWord.content }]);
  }

  // 7. 일정
  await upsert("weekly_schedule", (d.schedule ?? []).map((r, i) => ({
    bulletin_date: date,
    sort_order: i + 1,
    date_label: r.date_label ?? r.day_of_week ?? "매주",
    day_of_week: r.day_of_week ?? "",
    time: r.time ?? null,
    title: r.title,
    location: r.location ?? null,
  })));

  // 8. 교회학교
  await upsert("school_sermons", (d.schoolSermons ?? []).map(r => ({
    bulletin_date: date,
    department: r.department,
    preacher: r.preacher ?? "",
    scripture: r.scripture,
    sermon_title: r.sermon_title,
  })));

  // 9. 헌금
  await upsert("offering_donors_raw", (d.offeringDonors ?? []).map(r => ({
    bulletin_date: date,
    offering_type: r.offering_type,
    is_online: r.is_online,
    donor_names_raw: r.donor_names_raw,
  })));

  // 10. 선교회별 예배보고
  await upsert("mission_worship_report", (d.missionWorshipReports ?? []).map(r => ({
    bulletin_date: date,
    group_name: r.group_name,
    total_members: r.total_members ?? null,
    part1_count: r.part1_count ?? null,
    part2_count: r.part2_count ?? null,
    total_attendance: r.total_attendance ?? null,
    notes: r.notes ?? null,
  })));

  // 11. 금식/중보기도
  await upsert("fasting_prayer", (d.fastingPrayer ?? []).map(r => ({
    bulletin_date: date,
    prayer_date: r.prayer_date,
    day_of_week: r.day_of_week,
    prayer_type: r.prayer_type,
    order_number: r.order_number,
    member_name: r.member_name,
  })));

  console.log("\n✅ 업로드 완료!");
}

main().catch(console.error);
