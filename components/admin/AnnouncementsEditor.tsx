import { Announcement } from "@/types/bulletin";

interface Props {
  items: Announcement[];
  onChange: (items: Announcement[]) => void;
}

export default function AnnouncementsEditor({ items, onChange }: Props) {
  function update(index: number, field: keyof Announcement, value: string) {
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function add() {
    const newItem: Announcement = {
      id: items.length + 1,
      title: "새 광고",
      content: "",
    };
    onChange([...items, newItem]);
  }

  function remove(index: number) {
    onChange(
      items.filter((_, i) => i !== index).map((item, i) => ({ ...item, id: i + 1 }))
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="rounded border border-gray-100 bg-gray-50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-700 text-white text-xs font-bold">
              {item.id}
            </span>
            <input
              value={item.title}
              onChange={(e) => update(idx, "title", e.target.value)}
              placeholder="광고 제목"
              className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm font-semibold focus:border-amber-500 focus:outline-none"
            />
            <button
              onClick={() => remove(idx)}
              className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-50 shrink-0"
            >
              ✕ 삭제
            </button>
          </div>
          <textarea
            value={item.content}
            onChange={(e) => update(idx, "content", e.target.value)}
            placeholder="광고 내용"
            rows={3}
            className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm text-gray-600 focus:border-amber-500 focus:outline-none resize-none"
          />
        </div>
      ))}

      <button
        onClick={add}
        className="w-full rounded border-2 border-dashed border-amber-300 py-2 text-sm font-semibold text-amber-600 hover:border-amber-500 hover:bg-amber-50 transition-colors"
      >
        + 광고 추가
      </button>
    </div>
  );
}
