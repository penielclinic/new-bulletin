import { BulletinData } from "@/types/bulletin";

interface Props {
  weeklyWord: BulletinData["weeklyWord"];
  onChange: (field: keyof BulletinData["weeklyWord"], value: string) => void;
}

export default function WeeklyWordEditor({ weeklyWord, onChange }: Props) {
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">성경 구절 (인용)</label>
        <textarea
          value={weeklyWord.verse}
          onChange={(e) => onChange("verse", e.target.value)}
          rows={3}
          placeholder="성경 구절 본문"
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm italic text-amber-800 focus:border-amber-500 focus:outline-none resize-none"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">출처 (예: 스가랴 4:6)</label>
        <input
          value={weeklyWord.reference}
          onChange={(e) => onChange("reference", e.target.value)}
          placeholder="책 장:절"
          className="w-full rounded border border-gray-200 px-3 py-2 text-sm font-bold text-amber-600 focus:border-amber-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
