import { BulletinData } from "@/types/bulletin";
import { bulletinData as defaultData } from "@/lib/bulletinData";

export async function loadBulletin(date?: string): Promise<BulletinData> {
  try {
    const url = date ? `/api/bulletin?date=${date}` : "/api/bulletin";
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return defaultData;
    return await res.json();
  } catch {
    return defaultData;
  }
}

export async function saveBulletin(data: BulletinData): Promise<boolean> {
  try {
    const res = await fetch("/api/bulletin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function resetBulletin(): Promise<void> {
  await saveBulletin(defaultData);
}
