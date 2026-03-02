import { ScheduleItem } from "@/types/bulletin";

interface Props {
  items: ScheduleItem[];
  onChange: (items: ScheduleItem[]) => void;
}

const DAY_OPTIONS = ["주일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

export default function ScheduleEditor({ items, onChange }: Props) {
  function update(index: number, field: keyof ScheduleItem, value: string) {
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function add() {
    const newItem: ScheduleItem = {
      date: "",
      day: "주일",
      time: "",
      title: "새 일정",
      location: "",
    };
    onChange([...items, newItem]);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="rounded border border-gray-100 bg-gray-50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={item.date}
              onChange={(e) => update(idx, "date", e.target.value)}
              placeholder="날짜 (예: 2월 22일)"
              className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
            />
            <select
              value={item.day}
              onChange={(e) => update(idx, "day", e.target.value)}
              className="rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
            >
              {DAY_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              value={item.time}
              onChange={(e) => update(idx, "time", e.target.value)}
              placeholder="시간 (예: 11:00)"
              className="w-24 rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={() => remove(idx)}
              className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-50 shrink-0"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-2">
            <input
              value={item.title}
              onChange={(e) => update(idx, "title", e.target.value)}
              placeholder="행사명"
              className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm font-semibold focus:border-amber-500 focus:outline-none"
            />
            <input
              value={item.location ?? ""}
              onChange={(e) => update(idx, "location", e.target.value)}
              placeholder="장소 (선택)"
              className="w-28 rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>
      ))}

      <button
        onClick={add}
        className="w-full rounded border-2 border-dashed border-amber-300 py-2 text-sm font-semibold text-amber-600 hover:border-amber-500 hover:bg-amber-50 transition-colors"
      >
        + 일정 추가
      </button>
    </div>
  );
}
