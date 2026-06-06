"use client";

import { LetterRow } from "letter-minion";
import { useEffect, useState } from "react";

// Only authenticated requests reach "/" (middleware redirects others to /login).
export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 bg-[#f6f5f2] text-[#2a2a30]">
      {mounted && <LetterRow text="HELLO" gap={-12} width={96} height={120} />}
      <p className="text-gray-500">✅ 你已通过验证 —— 这里就是登录后的页面。</p>
      <button
        onClick={logout}
        className="px-6 py-3 rounded-full border-2 border-gray-900 text-gray-900 font-medium hover:bg-gray-900 hover:text-white transition-colors"
      >
        退出 · Log out
      </button>
    </main>
  );
}
