import { OfferingDonorGroup } from "@/types/bulletin";

interface Props {
  items: OfferingDonorGroup[];
}

export default function OfferingDonors({ items }: Props) {
  const offline = items.filter((i) => !i.is_online);
  const online = items.filter((i) => i.is_online);

  return (
    <section>
      <h2 className="section-title">헌금 드리신 분</h2>
      <div className="space-y-2">
        {offline.length > 0 && (
          <div>
            {offline.map((group, idx) => (
              <div key={idx} className="mb-1.5 rounded-lg px-4 py-2.5 text-xs" style={{ backgroundColor: "var(--cream)", border: "1px solid var(--gold-light)" }}>
                <span className="font-bold mr-2" style={{ color: "var(--navy)" }}>{group.offering_type}</span>
                <span className="text-gray-600 leading-5 flex flex-wrap gap-x-1">
                  {group.donor_names_raw.split(/\s+/).filter(Boolean).map((name, ni) => (
                    <span key={ni} className="whitespace-nowrap">{name}</span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        )}
        {online.length > 0 && (
          <div>
            <p className="text-xs font-bold mb-1.5 px-1" style={{ color: "var(--gold-text)" }}>온라인 헌금</p>
            {online.map((group, idx) => (
              <div key={idx} className="mb-1.5 rounded-lg px-4 py-2.5 text-xs" style={{ backgroundColor: "white", border: "1px solid var(--gold-light)" }}>
                <span className="font-bold mr-2" style={{ color: "var(--navy)" }}>{group.offering_type}</span>
                <span className="text-gray-600 leading-5 flex flex-wrap gap-x-1">
                  {group.donor_names_raw.split(/\s+/).filter(Boolean).map((name, ni) => (
                    <span key={ni} className="whitespace-nowrap">{name}</span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
