import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SERVICE_TYPES, ServiceType, WorshipItem } from "@/types/bulletin";

export async function GET() {
  const results = await Promise.all(
    SERVICE_TYPES.map((t) =>
      supabase.from("worship_orders").select("*").eq("worship_type", t).order("order_number")
    )
  );

  const data: Record<ServiceType, WorshipItem[]> = {} as Record<ServiceType, WorshipItem[]>;
  SERVICE_TYPES.forEach((t, i) => {
    data[t] = (results[i].data ?? []).map((r) => ({
      order: r.order_number,
      title: r.order_name,
      detail: r.detail ?? undefined,
      note: r.leader ?? undefined,
    }));
  });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body: Record<ServiceType, WorshipItem[]> = await request.json();

    for (const serviceType of SERVICE_TYPES) {
      const items = body[serviceType] ?? [];

      // 기존 데이터 삭제
      const { error: delError } = await supabase
        .from("worship_orders")
        .delete()
        .eq("worship_type", serviceType);
      if (delError) throw delError;

      // 새 데이터 삽입
      if (items.length > 0) {
        const rows = items.map((item) => ({
          worship_type: serviceType,
          order_number: item.order,
          order_name: item.title,
          detail: item.detail ?? null,
          leader: item.note ?? null,
        }));
        const { error: insError } = await supabase.from("worship_orders").insert(rows);
        if (insError) throw insError;
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
