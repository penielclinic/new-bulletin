import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { bulletinData as defaultData } from "@/lib/bulletinData";
import { SERVICE_TYPES } from "@/types/bulletin";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    let bulletinDate: string;
    if (dateParam) {
      bulletinDate = dateParam;
    } else {
      const { data: latestDate } = await supabase
        .from("announcements")
        .select("bulletin_date")
        .order("bulletin_date", { ascending: false })
        .limit(1)
        .single();
      bulletinDate = latestDate?.bulletin_date ?? "2026-03-01";
    }

    const serviceType = (searchParams.get("serviceType") ?? "주일대예배") as (typeof SERVICE_TYPES)[number];

    const [
      worshipRes, announcementsRes, churchRes, mottoRes,
      weeklyWordRes, scheduleRes, committeeRes, schoolRes,
      memberNewsRes, fastingRes, offeringDonorsRes,
      meetingsRes, groupsRes, accountsRes, staffRes,
      ...allWorshipResults
    ] = await Promise.all([
      supabase.from("worship_orders").select("*").eq("worship_type", serviceType).order("order_number"),
      supabase.from("announcements").select("*").eq("bulletin_date", bulletinDate).order("order_number"),
      supabase.from("church_info").select("*").eq("id", 1).single(),
      supabase.from("motto").select("*").order("year", { ascending: false }).limit(1).single(),
      supabase.from("weekly_word").select("*").eq("bulletin_date", bulletinDate).single(),
      supabase.from("weekly_schedule").select("*").eq("bulletin_date", bulletinDate).order("sort_order"),
      supabase.from("worship_committee").select("*").eq("bulletin_date", bulletinDate).order("week_type").order("id"),
      supabase.from("school_sermons").select("*").eq("bulletin_date", bulletinDate),
      supabase.from("member_news").select("*").eq("bulletin_date", bulletinDate),
      supabase.from("fasting_prayer").select("*").eq("bulletin_date", bulletinDate).order("prayer_date").order("prayer_type"),
      supabase.from("offering_donors_raw").select("*").eq("bulletin_date", bulletinDate).order("is_online").order("id"),
      supabase.from("meetings").select("*").order("id"),
      supabase.from("autonomous_groups").select("*").order("id"),
      supabase.from("offering_accounts").select("*").order("id"),
      supabase.from("staff_members").select("*").order("role_category").order("sort_order"),
      ...SERVICE_TYPES.map((t) =>
        supabase.from("worship_orders").select("*").eq("worship_type", t).order("order_number")
      ),
    ]);

    const allWorshipOrders = SERVICE_TYPES.map((t, i) => ({
      serviceType: t,
      items: (allWorshipResults[i]?.data ?? []).map((r: { order_number: number; order_name: string; detail?: string; leader?: string }) => ({
        order: r.order_number,
        title: r.order_name,
        detail: r.detail ?? undefined,
        note: r.leader ?? undefined,
      })),
    }));

    const worshipRows = worshipRes.data ?? [];
    const sermon = worshipRows.find((r) => r.order_name === "설교");
    const scriptureItem = worshipRows.find((r) => r.order_name === "성경봉독");
    const church = churchRes.data;
    const mottoRow = mottoRes.data;
    const wordRow = weeklyWordRes.data;
    const pastor = (staffRes.data ?? []).find((s: { role_category: string }) => s.role_category === "담임목사");

    const d = new Date(bulletinDate);
    const serviceDate = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 주일`;

    return NextResponse.json({
      church: {
        name: church?.name ?? defaultData.church.name,
        address: church?.address ?? defaultData.church.address,
        phone: church?.phone ?? defaultData.church.phone,
        pastor: pastor ? `담임목사 ${pastor.member_name}` : defaultData.church.pastor,
      },
      service: {
        date: serviceDate,
        serviceType,
        title: sermon?.detail ?? defaultData.service.title,
        scripture: scriptureItem?.detail ?? defaultData.service.scripture,
        preacher: sermon?.leader ?? defaultData.service.preacher,
      },
      motto: {
        year: mottoRow?.year ?? defaultData.motto.year,
        text: mottoRow?.text ?? defaultData.motto.text,
        scripture: mottoRow?.scripture ?? defaultData.motto.scripture,
      },
      allWorshipOrders,
      worshipOrder: worshipRows.map((r) => ({
        order: r.order_number,
        title: r.order_name,
        detail: r.detail ?? undefined,
        note: r.leader ?? undefined,
      })),
      announcements: (announcementsRes.data ?? []).map((r, idx) => ({
        id: idx + 1,
        title: r.title ?? "",
        content: r.content,
      })),
      weeklyWord: {
        verse: wordRow?.verse ?? defaultData.weeklyWord.verse,
        reference: wordRow?.reference ?? defaultData.weeklyWord.reference,
        content: wordRow?.content ?? defaultData.weeklyWord.content,
      },
      schedule: (scheduleRes.data ?? []).map((r) => ({
        date: r.date_label,
        day: r.day_of_week,
        time: r.time ?? "",
        title: r.title,
        location: r.location ?? undefined,
      })),
      worshipCommittee: (committeeRes.data ?? []).map((r) => ({
        week_type: r.week_type,
        service_date: r.service_date,
        role_type: r.role_type,
        service_part: r.service_part,
        member_name: r.member_name,
      })),
      schoolSermons: (schoolRes.data ?? []).map((r) => ({
        department: r.department,
        preacher: r.preacher,
        scripture: r.scripture,
        sermon_title: r.sermon_title,
      })),
      memberNews: (memberNewsRes.data ?? []).map((r) => ({
        news_type: r.news_type,
        member_name: r.member_name,
        detail: r.detail,
      })),
      fastingPrayer: (fastingRes.data ?? []).map((r) => ({
        prayer_date: r.prayer_date,
        day_of_week: r.day_of_week,
        prayer_type: r.prayer_type,
        order_number: r.order_number,
        member_name: r.member_name,
      })),
      offeringDonors: (offeringDonorsRes.data ?? []).map((r) => ({
        offering_type: r.offering_type,
        is_online: r.is_online,
        donor_names_raw: r.donor_names_raw,
      })),
      meetings: (meetingsRes.data ?? []).map((r) => ({
        meeting_name: r.meeting_name,
        schedule: r.schedule,
        location: r.location,
        note: r.note,
      })),
      autonomousGroups: (groupsRes.data ?? []).map((r) => ({
        group_name: r.group_name,
        gender: r.gender,
        age_range: r.age_range,
        representative: r.representative,
        location: r.location,
      })),
      offeringAccounts: (accountsRes.data ?? []).map((r) => ({
        account_type: r.account_type,
        bank_name: r.bank_name,
        account_number: r.account_number,
      })),
      staffMembers: (staffRes.data ?? []).map((r: { role_category: string; member_name: string; sort_order: number | null }) => ({
        role_category: r.role_category,
        member_name: r.member_name,
        sort_order: r.sort_order,
      })),
    });
  } catch {
    return NextResponse.json(defaultData);
  }
}

export async function POST(request: Request) {
  try {
    const bulletinData = await request.json();
    const { error } = await supabase
      .from("bulletins")
      .upsert({ id: 1, data: bulletinData }, { onConflict: "id" });
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
