import { OfferingAccount } from "@/types/bulletin";

interface Props {
  items: OfferingAccount[];
}

export default function OfferingAccounts({ items }: Props) {
  return (
    <section>
      <h2 className="section-title">헌금계좌</h2>
      <div className="rounded-lg overflow-hidden border" style={{ borderColor: "var(--gold-light)" }}>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3 px-4 py-2 text-xs" style={{ backgroundColor: idx % 2 === 0 ? "var(--cream)" : "white" }}>
            <span className="shrink-0 font-semibold w-32" style={{ color: "var(--navy)" }}>{item.account_type}</span>
            <span className="text-gray-500 shrink-0">{item.bank_name}</span>
            <span className="text-gray-700 font-mono">{item.account_number}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
