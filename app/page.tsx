"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { loadBulletin } from "@/lib/storage";
import { BulletinData, SERVICE_TYPE_LABELS } from "@/types/bulletin";
import BulletinHeader from "@/components/bulletin/BulletinHeader";
import WorshipOrder from "@/components/bulletin/WorshipOrder";
import Announcements from "@/components/bulletin/Announcements";
import WeeklyWord from "@/components/bulletin/WeeklyWord";
import Schedule from "@/components/bulletin/Schedule";
import WorshipCommittee from "@/components/bulletin/WorshipCommittee";
import SchoolSermons from "@/components/bulletin/SchoolSermons";
import MemberNews from "@/components/bulletin/MemberNews";
import FastingPrayer from "@/components/bulletin/FastingPrayer";
import MissionWorshipReport from "@/components/bulletin/MissionWorshipReport";
import OfferingDonors from "@/components/bulletin/OfferingDonors";
import Meetings from "@/components/bulletin/Meetings";
import AutonomousGroups from "@/components/bulletin/AutonomousGroups";
import OfferingAccounts from "@/components/bulletin/OfferingAccounts";
import StaffMembers from "@/components/bulletin/StaffMembers";
import PrintButton from "@/components/ui/PrintButton";
import Link from "next/link";

function HomeContent() {
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date") ?? undefined;
  const [data, setData] = useState<BulletinData | null>(null);

  useEffect(() => {
    loadBulletin(dateParam).then(setData);
  }, [dateParam]);

  if (!data) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-sm text-gray-400 animate-pulse">주보를 불러오는 중...</p>
      </div>
    );
  }

  const {
    church, service, motto, worshipOrder, allWorshipOrders, announcements, weeklyWord, schedule,
    worshipCommittee, schoolSermons, memberNews, fastingPrayer, missionWorshipReport,
    offeringDonors, meetings, autonomousGroups, offeringAccounts, staffMembers,
  } = data;

  return (
    <div className="min-h-screen bg-paper">
      {/* 상단 바 */}
      <div className="no-print sticky top-0 z-10 flex justify-between items-center bg-white/80 backdrop-blur px-3 sm:px-6 py-2 shadow-sm border-b border-amber-100 min-h-[52px]">
        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="rounded border px-4 py-2.5 text-xs font-semibold transition-colors"
            style={{ borderColor: "var(--navy)", color: "var(--navy)" }}
          >
            <span aria-hidden="true">⚙</span> 관리자
          </Link>
          <Link
            href="/calendar"
            className="rounded border px-4 py-2.5 text-xs font-semibold transition-colors"
            style={{ borderColor: "var(--navy)", color: "var(--navy)" }}
          >
            <span aria-hidden="true">📅</span> 달력
          </Link>
          {dateParam && (
            <span className="text-xs text-gray-500">
              {dateParam} 주보
            </span>
          )}
        </div>
        <PrintButton />
      </div>

      <main className="mx-auto max-w-2xl px-4 py-8 print:px-0 print:py-0 print:max-w-full">
        <div
          className="rounded-xl bg-white overflow-hidden print:rounded-none print:shadow-none"
          style={{
            boxShadow: "0 4px 32px rgba(27,50,82,0.10), 0 1px 4px rgba(184,150,62,0.08)",
            border: "1px solid var(--gold-light)",
          }}
        >
          <BulletinHeader church={church} service={service} motto={motto} />

          <div className="p-6 print:p-4 space-y-8">
            {/* 1단: 4개 예배순서 2×2 그리드 */}
            {allWorshipOrders.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 print:grid-cols-2">
                {allWorshipOrders.map(({ serviceType, items }) => (
                  <WorshipOrder
                    key={serviceType}
                    items={items}
                    serviceTypeName={SERVICE_TYPE_LABELS[serviceType] ?? serviceType}
                  />
                ))}
              </div>
            ) : (
              <WorshipOrder items={worshipOrder} />
            )}

            <Divider />

            {/* 2단: 이번 주 말씀 + 광고 + 일정 */}
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 print:grid-cols-2">
              <div className="space-y-7">
                <WeeklyWord weeklyWord={weeklyWord} />
              </div>
              <div className="space-y-7">
                <Announcements items={announcements} />
                <Schedule items={schedule} />
              </div>
            </div>

            <Divider />

            {/* 2단: 예배위원 */}
            {worshipCommittee.length > 0 && <WorshipCommittee items={worshipCommittee} />}

            {/* 3단: 교회학교 + 교우소식 */}
            {(schoolSermons.length > 0 || memberNews.length > 0) && (
              <div className="grid grid-cols-1 gap-7 md:grid-cols-2 print:grid-cols-2">
                {schoolSermons.length > 0 && <SchoolSermons items={schoolSermons} />}
                {memberNews.length > 0 && <MemberNews items={memberNews} />}
              </div>
            )}

            {/* 4단: 금식/중보기도 + 선교회별 예배보고 */}
            {fastingPrayer.length > 0 && <FastingPrayer items={fastingPrayer} />}
            {missionWorshipReport.length > 0 && <MissionWorshipReport items={missionWorshipReport} />}

            <Divider />

            {/* 5단: 헌금 드리신 분 */}
            {offeringDonors.length > 0 && <OfferingDonors items={offeringDonors} />}

            <Divider />

            {/* 6단: 모임 안내 + 자치기관 */}
            {(meetings.length > 0 || autonomousGroups.length > 0) && (
              <div className="grid grid-cols-1 gap-7 md:grid-cols-2 print:grid-cols-2">
                {meetings.length > 0 && <Meetings items={meetings} />}
                {autonomousGroups.length > 0 && <AutonomousGroups items={autonomousGroups} />}
              </div>
            )}

            {/* 7단: 헌금 계좌 */}
            {offeringAccounts.length > 0 && <OfferingAccounts items={offeringAccounts} />}

            {/* 8단: 섬기는 분들 */}
            {staffMembers.length > 0 && <StaffMembers items={staffMembers} />}

            <footer
              className="pt-4 text-center text-xs text-gray-400"
              style={{ borderTop: "1px solid var(--gold-light)" }}
            >
              <p className="tracking-wide flex flex-wrap justify-center gap-x-2 gap-y-0.5">
                <span>{church.name}</span>
                <span className="text-gray-300">·</span>
                <span>{church.address}</span>
                <span className="text-gray-300">·</span>
                <span>{church.phone}</span>
              </p>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <HomeContent />
    </Suspense>
  );
}

function Divider() {
  return (
    <div
      className="h-px"
      style={{ background: "linear-gradient(to right, transparent, var(--gold-light), transparent)" }}
    />
  );
}
