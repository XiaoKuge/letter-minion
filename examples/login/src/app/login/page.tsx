"use client";

import { useState, useRef, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { LetterRow } from "letter-minion";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Render the motion-driven letters only after mount to avoid a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: code }),
      });
      if (res.ok) {
        const from = new URLSearchParams(window.location.search).get("from");
        const safe = from && from.startsWith("/") && !from.startsWith("//");
        window.location.href = safe ? from : "/";
        return;
      }
      const data = await res.json().catch(() => ({}));
      setError(data.error || "访问码无效");
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <div className="w-300 h-180 flex border border-gray-200 rounded-xl shadow-md overflow-hidden max-w-[1000px]">
        {/* Left side — letter-minion mascots */}
        <div className="flex-1 relative bg-gray-200 p-12 flex items-center justify-center">
          <div className="relative w-full max-w-md h-96 flex items-center justify-center">
            {mounted && (
              <LetterRow text="QED" eyesClosed={showPassword} gap={-16} width={128} height={160} />
            )}
          </div>
        </div>

        {/* Right side — access form */}
        <div className="w-130 bg-white p-12 flex flex-col justify-center rounded-l-md">
          <div className="max-w-md mx-auto w-full">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">QED 研究</h1>
            <p className="text-gray-500 mb-8">请输入访问码进入（示例访问码：demo）</p>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  访问码 · Access code
                </label>
                <div className="relative">
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? "text" : "password"}
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    autoComplete="off"
                    className="w-full px-0 py-3 pr-10 border-0 border-b-2 border-gray-300 focus:border-gray-900 focus:outline-none focus:ring-0 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                      const input = passwordInputRef.current;
                      if (input) {
                        input.focus();
                        setTimeout(() => {
                          input.setSelectionRange(input.value.length, input.value.length);
                        }, 0);
                      }
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "隐藏访问码" : "显示访问码"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-4 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-60"
              >
                {loading ? "验证中…" : "进入 · Enter"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
