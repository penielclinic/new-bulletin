import { request as httpsRequest } from "https";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are an expert at reading Korean church bulletins (주보) and extracting structured data for database insertion.
Analyze the bulletin carefully and return ONLY a JSON object with NO explanation, NO markdown, just raw JSON.

Extract the following data:
1. bulletinDate: The bulletin date in "YYYY-MM-DD" format (e.g., "2026-01-25")
2. allWorshipOrders: Worship orders for ALL 4 service types found in the bulletin:
   - "주일대예배" (Sunday Main Service)
   - "주일오후예배" (Sunday Afternoon Service)
   - "삼일밤예배" (Wednesday Night Service, may also appear as "수요밤예배")
   - "금요성령기도회" (Friday Holy Spirit Prayer Meeting)
3. worshipCommittee: Worship committee members for 금주(this week) and 차주(next week)
4. announcements: Church announcements with title and content
5. weeklyWord: The weekly scripture passage
6. schedule: Weekly church schedule
7. schoolSermons: Church school sermon info (교회학교 설교) for each department
8. offeringDonors: All offering donor lists (헌금 드리신 분) — both offline and online
9. missionWorshipReports: 선교회별 예배보고현황 (attendance report by mission group)
10. fastingPrayer: 가정별 아침 금식 및 중보기도 schedule (fasting and intercessory prayer by family/person)

Return this exact JSON structure:
{
  "bulletinDate": "YYYY-MM-DD",
  "allWorshipOrders": [
    {
      "serviceType": "주일대예배",
      "items": [
        {"order": 1, "title": "순서명", "detail": "내용 또는 null", "note": "인도자 또는 null", "standing": false}
      ]
    },
    {"serviceType": "주일오후예배", "items": [...]},
    {"serviceType": "삼일밤예배", "items": [...]},
    {"serviceType": "금요성령기도회", "items": [...]}
  ],
  "worshipCommittee": [
    {"week_type": "금주", "service_date": "YYYY-MM-DD", "role_type": "역할명", "service_part": "1부 또는 2부 또는 null", "member_name": "이름들"}
  ],
  "announcements": [
    {"order": 1, "title": "제목", "content": "내용"}
  ],
  "weeklyWord": {
    "verse": "성경 구절 원문",
    "reference": "책 장:절",
    "content": "묵상 내용 (없으면 빈 문자열)"
  },
  "schedule": [
    {"date_label": "1월 25일", "day_of_week": "주일", "time": "09:00", "title": "행사명", "location": "장소 또는 null"}
  ],
  "schoolSermons": [
    {"department": "유치부", "preacher": "홍길동 목사", "scripture": "마4:23", "sermon_title": "설교 제목"}
  ],
  "offeringDonors": [
    {"offering_type": "십일조", "is_online": false, "donor_names_raw": "이름1 이름2 이름3..."}
  ],
  "missionWorshipReports": [
    {"group_name": "1선교회", "total_members": 30, "part1_count": 8, "part2_count": 22, "total_attendance": 30, "notes": null}
  ],
  "fastingPrayer": [
    {"prayer_date": "YYYY-MM-DD", "day_of_week": "월", "prayer_type": "금식", "order_number": 43, "member_name": "박소영B"},
    {"prayer_date": "YYYY-MM-DD", "day_of_week": "월", "prayer_type": "중보", "order_number": 44, "member_name": "한미영"}
  ]
}

Important rules:
- Use null (not empty string) for missing optional values
- For worshipCommittee role_type use exactly: 예배위원(선교회), 사회, 기도인도, 헌금위원, 정문, 3층, 실내, 중층, 중식
- service_part should be "1부", "2부", or null
- member_name: list all names separated by spaces
- standing: true if the item has a ▲ triangle symbol (일어서서 예배) next to it, false otherwise
- If a service type is not found in the bulletin, include it with empty items array
- Extract ALL announcements, even if there are many
- schoolSermons: extract ALL departments (유치부, 유초등부, 중고등부, 청년교회 etc.)
- offeringDonors: extract ALL offering types. is_online=true for 온라인헌금 section, false for 현장헌금. Copy donor names exactly as written including parentheses. If no donors section found, return empty array
- missionWorshipReports: extract the "선교회별 예배보고현황" table. group_name is the mission group name. Count numbers for total_members/part1_count/part2_count/total_attendance (null if not shown). If section not found, return empty array
- fastingPrayer: extract the "가정별 아침 금식 및 중보기도" section. For each day row, create TWO entries — one with prayer_type="금식" and one with prayer_type="중보". prayer_date must be the actual calendar date in YYYY-MM-DD format (calculate from bulletin context and day of week). order_number is the rotation number (순). If section not found, return empty array`;

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

    if (!file) {
      return Response.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    const base64 = btoa(binary);

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const mediaType = isPdf ? "application/pdf" : (file.type || "image/jpeg");

    const contentBlock = isPdf
      ? { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } }
      : { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } };

    const payload = {
      model: "claude-opus-4-6",
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            contentBlock,
            { type: "text", text: "이 주보에서 모든 데이터를 추출하여 JSON으로 반환해주세요." },
          ],
        },
      ],
    };

    const apiKey = (process.env.ANTHROPIC_API_KEY ?? "").trim();
    const responseText = await callAnthropic(apiKey, payload);
    const apiData = JSON.parse(responseText);

    if (apiData.error) {
      return Response.json({ error: "AI 분석 실패: " + apiData.error.message }, { status: 500 });
    }

    const text: string = apiData.content?.[0]?.text ?? "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return Response.json({ data: parsed });
  } catch (err) {
    console.error("주보 파싱 오류:", err);
    return Response.json({ error: "파일 분석 중 오류가 발생했습니다: " + String(err) }, { status: 500 });
  }
}
