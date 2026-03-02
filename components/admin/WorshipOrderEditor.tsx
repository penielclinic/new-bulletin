import { WorshipItem } from "@/types/bulletin";

interface Props {
  items: WorshipItem[];
  onChange: (items: WorshipItem[]) => void;
}

export default function WorshipOrderEditor({ items, onChange }: Props) {
  function update(index: number, field: keyof WorshipItem, value: string | number) {
    const next = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(next);
  }

  function add() {
    const next: WorshipItem = {
      order: items.length + 1,
      title: "새 순서",
      detail: "",
    };
    onChange([...items, next]);
  }

  function remove(index: number) {
    const next = items
      .filter((_, i) => i !== index)
      .map((item, i) => ({ ...item, order: i + 1 }));
    onChange(next);
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...items];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next.map((item, i) => ({ ...item, order: i + 1 })));
  }

  function moveDown(index: number) {
    if (index === items.length - 1) return;
    const next = [...items];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next.map((item, i) => ({ ...item, order: i + 1 })));
  }

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2 rounded border border-gray-100 bg-gray-50 p-3">
          {/* 순서 번호 */}
          <span className="mt-2 w-6 text-center text-sm font-bold text-amber-600 shrink-0">
            {item.order}
          </span>

          {/* 입력 필드 */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            <input
              value={item.title}
              onChange={(e) => update(idx, "title", e.target.value)}
              placeholder="순서명"
              className="rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
            />
            <input
              value={item.detail ?? ""}
              onChange={(e) => update(idx, "detail", e.target.value)}
              placeholder="내용"
              className="rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
            />
            <input
              value={item.note ?? ""}
              onChange={(e) => update(idx, "note", e.target.value)}
              placeholder="비고 (선택)"
              className="col-span-2 rounded border border-gray-200 px-2 py-1.5 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* 컨트롤 버튼 */}
          <div className="flex flex-col gap-1 shrink-0">
            <button
              onClick={() => moveUp(idx)}
              disabled={idx === 0}
              className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-200 disabled:opacity-30"
            >
              ▲
            </button>
            <button
              onClick={() => moveDown(idx)}
              disabled={idx === items.length - 1}
              className="rounded px-2 py-1 text-xs text-gray-400 hover:bg-gray-200 disabled:opacity-30"
            >
              ▼
            </button>
            <button
              onClick={() => remove(idx)}
              className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-50"
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      <button
        onClick={add}
        className="w-full rounded border-2 border-dashed border-amber-300 py-2 text-sm font-semibold text-amber-600 hover:border-amber-500 hover:bg-amber-50 transition-colors"
      >
        + 순서 추가
      </button>
    </div>
  );
}
