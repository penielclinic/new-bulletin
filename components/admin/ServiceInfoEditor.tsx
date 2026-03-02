import { BulletinData, SERVICE_TYPES, SERVICE_TYPE_LABELS, ServiceType } from "@/types/bulletin";

interface Props {
  church: BulletinData["church"];
  service: BulletinData["service"];
  motto: BulletinData["motto"];
  onChange: (
    key: "church" | "service" | "motto",
    field: string,
    value: string | number
  ) => void;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
      />
    </div>
  );
}

export default function ServiceInfoEditor({ church, service, motto, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* 교회 정보 */}
      <section>
        <h3 className="admin-section-title">교회 정보</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="교회 이름" value={church.name} onChange={(v) => onChange("church", "name", v)} />
          <Field label="담임 목사" value={church.pastor} onChange={(v) => onChange("church", "pastor", v)} />
          <Field label="주소" value={church.address} onChange={(v) => onChange("church", "address", v)} />
          <Field label="전화번호" value={church.phone} onChange={(v) => onChange("church", "phone", v)} />
        </div>
      </section>

      {/* 이번 주 예배 */}
      <section>
        <h3 className="admin-section-title">이번 주 예배</h3>
        <div className="grid grid-cols-2 gap-3">
          <Field label="날짜" value={service.date} onChange={(v) => onChange("service", "date", v)} />
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">예배 종류</label>
            <select
              value={service.serviceType}
              onChange={(e) => onChange("service", "serviceType", e.target.value as ServiceType)}
              className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none bg-white"
            >
              {SERVICE_TYPES.map((type) => (
                <option key={type} value={type}>{SERVICE_TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>
          <Field label="설교자" value={service.preacher} onChange={(v) => onChange("service", "preacher", v)} />
          <div className="col-span-2">
            <Field label="설교 제목" value={service.title} onChange={(v) => onChange("service", "title", v)} />
          </div>
          <div className="col-span-2">
            <Field label="성경 본문" value={service.scripture} onChange={(v) => onChange("service", "scripture", v)} />
          </div>
        </div>
      </section>

      {/* 연간 표어 */}
      <section>
        <h3 className="admin-section-title">연간 표어</h3>
        <div className="grid grid-cols-3 gap-3">
          <Field label="연도" value={motto.year} type="number" onChange={(v) => onChange("motto", "year", Number(v))} />
          <div className="col-span-2">
            <Field label="표어" value={motto.text} onChange={(v) => onChange("motto", "text", v)} />
          </div>
          <div className="col-span-3">
            <Field label="성경 구절" value={motto.scripture} onChange={(v) => onChange("motto", "scripture", v)} />
          </div>
        </div>
      </section>
    </div>
  );
}
