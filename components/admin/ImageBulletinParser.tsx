"use client";

import { useRef, useState } from "react";
import { BulletinData } from "@/types/bulletin";

interface Props {
  onParsed: (data: BulletinData) => void;
}

export default function ImageBulletinParser({ onParsed }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFile(file: File) {
    setPreview(URL.createObjectURL(file));
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/parse-bulletin", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error ?? "알 수 없는 오류");
      }

      onParsed(json.data);
      setStatus("ok");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setStatus("error");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }

  return (
    <div className="mb-6">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => status !== "loading" && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer
          ${status === "loading" ? "border-amber-300 bg-amber-50 cursor-wait" : "border-gray-200 hover:border-amber-400 hover:bg-amber-50/40"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />

        {preview && (
          <img src={preview} alt="미리보기" className="mb-2 max-h-32 rounded object-contain shadow" />
        )}

        {status === "loading" ? (
          <>
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
            <p className="text-sm text-amber-700 font-medium">AI가 주보를 분석하는 중...</p>
          </>
        ) : status === "ok" ? (
          <>
            <span className="text-2xl">✓</span>
            <p className="text-sm text-green-700 font-medium">주보 내용이 자동으로 입력되었습니다!</p>
            <p className="text-xs text-gray-400">내용을 확인 후 저장 버튼을 눌러주세요.</p>
          </>
        ) : (
          <>
            <span className="text-3xl text-gray-300">📷</span>
            <p className="text-sm font-medium text-gray-600">주보 이미지를 업로드하면 자동으로 내용을 입력합니다</p>
            <p className="text-xs text-gray-400">클릭하거나 이미지를 드래그하세요 (JPG, PNG)</p>
          </>
        )}

        {status === "error" && (
          <p className="mt-1 rounded bg-red-50 px-3 py-1.5 text-xs text-red-600 font-medium">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}
