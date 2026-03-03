export interface WorshipItem {
  order: number;
  title: string;
  detail?: string;
  note?: string;
  standing?: boolean;
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
}

export interface ScheduleItem {
  date: string;
  day: string;
  time: string;
  title: string;
  location?: string;
}

export interface WorshipCommitteeItem {
  week_type: string;
  service_date: string;
  role_type: string;
  service_part: string | null;
  member_name: string;
}

export interface SchoolSermon {
  department: string;
  preacher: string;
  scripture: string | null;
  sermon_title: string | null;
}

export interface MemberNewsItem {
  news_type: string;
  member_name: string;
  detail: string | null;
}

export interface FastingPrayerItem {
  prayer_date: string;
  day_of_week: string;
  prayer_type: string;
  order_number: number;
  member_name: string;
}

export interface MissionWorshipReportItem {
  group_name: string;
  total_members: number | null;
  part1_count: number | null;
  part2_count: number | null;
  total_attendance: number | null;
  notes: string | null;
}

export interface OfferingDonorGroup {
  offering_type: string;
  is_online: boolean;
  donor_names_raw: string;
}

export interface MeetingItem {
  meeting_name: string;
  schedule: string | null;
  location: string | null;
  note: string | null;
}

export interface AutonomousGroup {
  group_name: string;
  gender: string | null;
  age_range: string | null;
  representative: string | null;
  location: string | null;
}

export interface OfferingAccount {
  account_type: string;
  bank_name: string;
  account_number: string;
}

export interface StaffMember {
  role_category: string;
  member_name: string;
  sort_order: number | null;
}

export const SERVICE_TYPES = [
  "주일대예배",
  "주일오후예배",
  "삼일밤예배",
  "금요성령기도회",
] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  "주일대예배": "주일대예배",
  "주일오후예배": "주일오후예배",
  "삼일밤예배": "수요밤예배(삼일밤예배)",
  "금요성령기도회": "금요성령기도회",
};

export interface ServiceWorshipOrders {
  serviceType: ServiceType;
  items: WorshipItem[];
}

export interface BulletinData {
  church: {
    name: string;
    address: string;
    phone: string;
    pastor: string;
  };
  service: {
    date: string;
    serviceType: ServiceType;
    title: string;
    scripture: string;
    preacher: string;
  };
  motto: {
    year: number;
    text: string;
    scripture: string;
  };
  worshipOrder: WorshipItem[];
  allWorshipOrders: ServiceWorshipOrders[];
  announcements: Announcement[];
  weeklyWord: {
    verse: string;
    reference: string;
    content: string;
  };
  schedule: ScheduleItem[];
  worshipCommittee: WorshipCommitteeItem[];
  schoolSermons: SchoolSermon[];
  memberNews: MemberNewsItem[];
  fastingPrayer: FastingPrayerItem[];
  missionWorshipReport: MissionWorshipReportItem[];
  offeringDonors: OfferingDonorGroup[];
  meetings: MeetingItem[];
  autonomousGroups: AutonomousGroup[];
  offeringAccounts: OfferingAccount[];
  staffMembers: StaffMember[];
}
