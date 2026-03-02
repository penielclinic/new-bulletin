import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { WorshipCommitteeItem } from "@/types/bulletin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json([]);

  const { data, error } = await supabase
    .from("worship_committee")
    .select("*")
    .eq("bulletin_date", date)
    .order("week_type")
    .order("id");

  if (error) return NextResponse.json([], { status: 500 });

  const items: WorshipCommitteeItem[] = (data ?? []).map((r) => ({
    week_type: r.week_type,
    service_date: r.service_date,
    role_type: r.role_type,
    service_part: r.service_part,
    member_name: r.member_name,
  }));

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const { bulletinDate, items }: { bulletinDate: string; items: WorshipCommitteeItem[] } =
      await request.json();

    // 기존 데이터 삭제
    const { error: delError } = await supabase
      .from("worship_committee")
      .delete()
      .eq("bulletin_date", bulletinDate);
    if (delError) throw delError;

    // 새 데이터 삽입
    if (items.length > 0) {
      const rows = items.map((item) => ({
        bulletin_date: bulletinDate,
        week_type: item.week_type,
        service_date: item.service_date,
        role_type: item.role_type,
        service_part: item.service_part || null,
        member_name: item.member_name,
      }));
      const { error: insError } = await supabase.from("worship_committee").insert(rows);
      if (insError) throw insError;
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
