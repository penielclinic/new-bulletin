import { request as httpsRequest } from "https";
import { BulletinData } from "@/types/bulletin";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are an expert at analyzing Korean church bulletin images and extracting structured data.
Read the image and return ONLY a JSON object matching this schema. No explanation, no markdown, just raw JSON.
For missing values use empty string "".

Schema:
{
  "church": { "name": "", "address": "", "phone": "", "pastor": "" },
  "service": { "date": "", "title": "", "scripture": "", "preacher": "" },
  "motto": { "year": 0, "text": "", "scripture": "" },
  "worshipOrder": [{ "order": 1, "title": "", "detail": "", "note": "" }],
  "announcements": [{ "id": 1, "title": "", "content": "" }],
  "weeklyWord": { "verse": "", "reference": "", "content": "" },
  "schedule": [{ "date": "", "day": "", "time": "", "title": "", "location": "" }]
}`;

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
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
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
    const file = formData.get("image") as File | null;

    if (!file) {
      return Response.json({ error: "이미지 파일이 없습니다." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    const mediaType = (file.type || "image/jpeg") as string;

    const payload = {
      model: "claude-opus-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data: base64 },
            },
            {
              type: "text",
              text: "Extract all bulletin content and return as JSON.",
            },
          ],
        },
      ],
    };

    const apiKey = (process.env.ANTHROPIC_API_KEY ?? "").trim();
    const responseText = await callAnthropic(apiKey, payload);
    const apiData = JSON.parse(responseText);

    if (apiData.error) {
      console.error("Anthropic API 오류:", apiData.error);
      return Response.json({ error: "AI 분석 실패: " + apiData.error.message }, { status: 500 });
    }

    const text: string = apiData.content?.[0]?.text ?? "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed: BulletinData = JSON.parse(cleaned);

    return Response.json({ data: parsed });
  } catch (err) {
    console.error("주보 파싱 오류:", err);
    return Response.json({ error: "이미지 분석 중 오류가 발생했습니다." }, { status: 500 });
  }
}
