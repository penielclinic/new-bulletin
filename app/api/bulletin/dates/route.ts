import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("bulletin_date")
      .order("bulletin_date", { ascending: false });

    if (error) throw error;

    const dates = [...new Set((data ?? []).map((r) => r.bulletin_date as string))];
    return NextResponse.json(dates);
  } catch {
    return NextResponse.json([]);
  }
}
