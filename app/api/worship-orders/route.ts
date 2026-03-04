import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { SERVICE_TYPES, ServiceType, WorshipItem } from "@/types/bulletin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  const results = await Promise.all(
    SERVICE_TYPES.map((t) => {
      let q = supabase.from("worship_orders").select("*").eq("worship_type", t).order("order_number");
      if (date) q = q.eq("bulletin_date", date);
      return q;
    })
  );

  const data: Record<ServiceType, WorshipItem[]> = {} as Record<ServiceType, WorshipItem[]>;
  SERVICE_TYPES.forEach((t, i) => {
    data[t] = (results[i].data ?? []).map((r) => ({
      order: r.order_number,
      title: r.order_name,
      detail: r.detail ?? undefined,
      note: r.leader ?? undefined,
      standing: r.standing ?? false,
    }));
  });

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body: { date: string; orders: Record<ServiceType, WorshipItem[]> } = await request.json();
    const { date, orders } = body;

    for (const serviceType of SERVICE_TYPES) {
      const items = orders[serviceType] ?? [];

      const { error: delError } = await supabase
        .from("worship_orders")
        .delete()
        .eq("worship_type", serviceType)
        .eq("bulletin_date", date);
      if (delError) throw delError;

      if (items.length > 0) {
        const rows = items.map((item) => ({
          bulletin_date: date,
          worship_type: serviceType,
          order_number: item.order,
          order_name: item.title,
          detail: item.detail ?? null,
          leader: item.note ?? null,
          standing: item.standing ?? false,
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
