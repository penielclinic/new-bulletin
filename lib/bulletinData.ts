import { BulletinData } from "@/types/bulletin";

export const bulletinData: BulletinData = {
  church: {
    name: "해운대순복음교회",
    address: "부산광역시 해운대구",
    phone: "051-000-0000",
    pastor: "담임목사 홍길동",
  },
  service: {
    date: "2026년 2월 22일 주일",
    serviceType: "주일대예배",
    title: "성령의 능력으로 세워지는 교회",
    scripture: "스가랴 4:6-9",
    preacher: "홍길동 목사",
  },
  motto: {
    year: 2026,
    text: "오직 나의 영으로",
    scripture: "슥 4:6-9",
  },
  worshipOrder: [
    { order: 1, title: "예배로의 부름", detail: "사회자" },
    { order: 2, title: "찬 양", detail: "찬송가 1장", note: "만복의 근원 하나님" },
    { order: 3, title: "신 앙 고 백", detail: "사도신경" },
    { order: 4, title: "기 도", detail: "대표기도" },
    { order: 5, title: "성 경 봉 독", detail: "스가랴 4:6-9" },
    { order: 6, title: "찬 양", detail: "찬송가 185장", note: "내 구주 예수를 더욱 사랑" },
    { order: 7, title: "설 교", detail: "성령의 능력으로 세워지는 교회", note: "홍길동 목사" },
    { order: 8, title: "기 도", detail: "목사기도" },
    { order: 9, title: "찬 양", detail: "찬송가 305장", note: "나 같은 죄인 살리신" },
    { order: 10, title: "봉 헌", detail: "헌금 및 기도" },
    { order: 11, title: "광 고", detail: "사회자" },
    { order: 12, title: "축 도", detail: "담임목사" },
  ],
  announcements: [
    {
      id: 1,
      title: "2월 정기 새벽기도회",
      content:
        "매주 월~금 오전 5:30 본당에서 새벽기도회가 진행됩니다. 많은 성도님의 참여를 부탁드립니다.",
    },
    {
      id: 2,
      title: "구역 모임 안내",
      content:
        "이번 주 수요일(25일) 각 구역별 모임이 있습니다. 구역장님께 확인하시어 빠짐없이 참석해 주시기 바랍니다.",
    },
    {
      id: 3,
      title: "헌신예배 — 청년부",
      content:
        "3월 1일(주일) 오후 2시 청년부 헌신예배가 있습니다. 청년 성도 여러분의 적극적인 참여를 바랍니다.",
    },
    {
      id: 4,
      title: "교회학교 교사 모집",
      content:
        "어린이 교회학교 교사를 모집합니다. 관심 있으신 분은 교육부 담당자에게 문의해 주세요.",
    },
  ],
  weeklyWord: {
    verse:
      "\"그가 내게 대답하여 이르되 여호와께서 스룹바벨에게 하신 말씀이 이러하니라 만군의 여호와께서 말씀하시되 이는 힘으로 되지 아니하며 능력으로 되지 아니하고 오직 나의 영으로 되느니라\"",
    reference: "스가랴 4:6",
    content:
      "우리의 삶과 사역은 인간의 힘과 능력으로 이루어지지 않습니다. 오직 하나님의 영, 성령의 역사하심으로 가능합니다. 이 주간도 인간적인 방법을 의지하기보다 성령의 인도하심에 온전히 맡기는 한 주가 되기를 소망합니다. 기도와 말씀으로 성령 충만함을 구하며 각자의 자리에서 하나님의 나라를 세워가는 성도님들이 되시길 축복합니다.",
  },
  schedule: [
    {
      date: "2월 22일",
      day: "주일",
      time: "11:00",
      title: "주일 낮 예배",
      location: "본당",
    },
    {
      date: "2월 22일",
      day: "주일",
      time: "14:00",
      title: "주일 오후 예배",
      location: "본당",
    },
    {
      date: "2월 25일",
      day: "수요일",
      time: "19:30",
      title: "수요 예배 & 구역 모임",
      location: "본당",
    },
    {
      date: "2월 26일",
      day: "목요일",
      time: "10:00",
      title: "목장 모임",
      location: "소예배실",
    },
    {
      date: "2월 28일",
      day: "토요일",
      time: "14:00",
      title: "중보기도 모임",
      location: "기도실",
    },
    {
      date: "3월 1일",
      day: "주일",
      time: "14:00",
      title: "청년부 헌신예배",
      location: "본당",
    },
  ],
  allWorshipOrders: [],
  worshipCommittee: [],
  schoolSermons: [],
  memberNews: [],
  fastingPrayer: [],
  offeringDonors: [],
  meetings: [],
  autonomousGroups: [],
  offeringAccounts: [],
  staffMembers: [],
};
