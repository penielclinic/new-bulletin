import { request as httpsRequest } from "https";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseHeaders = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
  Prefer: "resolution=merge-duplicates",
};

async function supabaseUpsert(table: string, rows: object[]) {
  if (!rows.length) return;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: supabaseHeaders,
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`${table} 저장 실패: ${await res.text()}`);
}

async function supabaseDelete(table: string, date: string) {
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?bulletin_date=eq.${date}`, {
    method: "DELETE",
    headers: supabaseHeaders,
  });
}

function callAnthropic(apiKey: string, payload: object): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify(payload), "utf-8");
    const req = httpsRequest(
      {
        hostname: "api.anthropic.com",
        path: "/v1/messages",
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json; charset=utf-8",
          "content-length": body.byteLength,
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        res.on("error", reject);
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return Response.json({ error: "파일이 없습니다." }, { status: 400 });

    // 1. PDF → base64
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);

    // 2. Anthropic으로 파싱
    const SYSTEM_PROMPT = await fetch(new URL("/api/parse-bulletin-sql", request.url))
      .then(() => null)
      .catch(() => null);
    void SYSTEM_PROMPT;

    // parse-bulletin-sql 라우트의 SYSTEM_PROMPT를 재사용하기 위해 직접 호출
    const parseForm = new FormData();
    parseForm.append("file", file);
    const parseRes = await fetch(new URL("/api/parse-bulletin-sql", request.url), {
      method: "POST",
      body: parseForm,
    });
    const parseJson = await parseRes.json();
    if (parseJson.error) return Response.json({ error: parseJson.error }, { status: 500 });

    const d = parseJson.data;
    const date = d.bulletinDate;

    // 3. 기존 데이터 삭제
    for (const table of [
      "announcements", "worship_committee", "weekly_word", "weekly_schedule",
      "school_sermons", "offering_donors_raw", "mission_worship_report", "fasting_prayer", "member_news",
    ]) {
      await supabaseDelete(table, date);
    }
    // worship_orders는 날짜+타입 기준
    for (const wo of (d.allWorshipOrders ?? [])) {
      await fetch(`${SUPABASE_URL}/rest/v1/worship_orders?bulletin_date=eq.${date}&worship_type=eq.${encodeURIComponent(wo.serviceType)}`, {
        method: "DELETE", headers: supabaseHeaders,
      });
    }

    // 4. 예배순서
    for (const wo of (d.allWorshipOrders ?? [])) {
      if (!wo.items?.length) continue;
      await supabaseUpsert("worship_orders", wo.items.map((item: { order: number; title: string; detail?: string; note?: string; standing?: boolean }) => ({
        bulletin_date: date, worship_type: wo.serviceType,
        order_number: item.order, order_name: item.title,
        detail: item.detail ?? null, leader: item.note ?? null, standing: item.standing ?? false,
      })));
    }

    // 5. 예배위원
    await supabaseUpsert("worship_committee", (d.worshipCommittee ?? []).map((r: { week_type: string; service_date: string; role_type: string; service_part?: string; member_name: string }) => ({
      bulletin_date: date, week_type: r.week_type, service_date: r.service_date,
      role_type: r.role_type, service_part: r.service_part ?? null, member_name: r.member_name,
    })));

    // 6. 광고
    await supabaseUpsert("announcements", (d.announcements ?? []).map((r: { order: number; title: string; content: string }) => ({
      bulletin_date: date, order_number: r.order, title: r.title, content: r.content,
    })));

    // 7. 이번 주 말씀
    if (d.weeklyWord) {
      await supabaseUpsert("weekly_word", [{ bulletin_date: date, verse: d.weeklyWord.verse, reference: d.weeklyWord.reference, content: d.weeklyWord.content }]);
    }

    // 8. 일정
    await supabaseUpsert("weekly_schedule", (d.schedule ?? []).map((r: { date_label?: string; day_of_week?: string; time?: string; title: string; location?: string }, i: number) => ({
      bulletin_date: date, sort_order: i + 1,
      date_label: r.date_label ?? r.day_of_week ?? "매주",
      day_of_week: r.day_of_week ?? "", time: r.time ?? null,
      title: r.title, location: r.location ?? null,
    })));

    // 9. 교회학교
    await supabaseUpsert("school_sermons", (d.schoolSermons ?? []).map((r: { department: string; preacher?: string; scripture: string; sermon_title: string }) => ({
      bulletin_date: date, department: r.department, preacher: r.preacher ?? "",
      scripture: r.scripture, sermon_title: r.sermon_title,
    })));

    // 10. 헌금
    await supabaseUpsert("offering_donors_raw", (d.offeringDonors ?? []).map((r: { offering_type: string; is_online: boolean; donor_names_raw: string }) => ({
      bulletin_date: date, offering_type: r.offering_type,
      is_online: r.is_online, donor_names_raw: r.donor_names_raw,
    })));

    // 11. 선교회별 예배보고
    await supabaseUpsert("mission_worship_report", (d.missionWorshipReports ?? []).map((r: { group_name: string; total_members?: number; part1_count?: number; part2_count?: number; total_attendance?: number; notes?: string }) => ({
      bulletin_date: date, group_name: r.group_name,
      total_members: r.total_members ?? null, part1_count: r.part1_count ?? null,
      part2_count: r.part2_count ?? null, total_attendance: r.total_attendance ?? null,
      notes: r.notes ?? null,
    })));

    // 12. 금식기도
    await supabaseUpsert("fasting_prayer", (d.fastingPrayer ?? []).map((r: { prayer_date: string; day_of_week: string; prayer_type: string; order_number: number; member_name: string }) => ({
      bulletin_date: date, prayer_date: r.prayer_date, day_of_week: r.day_of_week,
      prayer_type: r.prayer_type, order_number: r.order_number, member_name: r.member_name,
    })));

    // 13. 교우소식
    await supabaseUpsert("member_news", (d.memberNews ?? []).filter((r: { member_name?: string }) => r.member_name).map((r: { news_type: string; member_name: string; detail?: string }) => ({
      bulletin_date: date, news_type: r.news_type,
      member_name: r.member_name, detail: r.detail ?? null,
    })));

    return Response.json({
      success: true,
      date,
      summary: {
        worshipOrders: d.allWorshipOrders?.reduce((s: number, o: { items?: unknown[] }) => s + (o.items?.length ?? 0), 0) ?? 0,
        announcements: d.announcements?.length ?? 0,
        worshipCommittee: d.worshipCommittee?.length ?? 0,
        schoolSermons: d.schoolSermons?.length ?? 0,
        offeringDonors: d.offeringDonors?.length ?? 0,
        missionReports: d.missionWorshipReports?.length ?? 0,
        fastingPrayer: d.fastingPrayer?.length ?? 0,
        memberNews: d.memberNews?.length ?? 0,
      },
    });
  } catch (err) {
    console.error("업로드 오류:", err);
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
