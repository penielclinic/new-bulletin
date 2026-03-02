"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const { error: msg } = await res.json();
      setError(msg ?? "로그인에 실패했습니다.");
      setPassword("");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f9f7f4]">
      <div className="w-full max-w-sm rounded-lg bg-white shadow-md p-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <p className="text-xs text-amber-700 font-semibold tracking-widest mb-1">
            해운대순복음교회
          </p>
          <h1 className="text-xl font-extrabold text-gray-900">관리자 로그인</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              autoFocus
              required
              className="w-full rounded border border-gray-200 px-3 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-600 font-medium">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-amber-700 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 transition-colors disabled:opacity-60"
          >
            {loading ? "확인 중..." : "로그인"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          비밀번호는 <code>.env.local</code> 에서 변경할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
