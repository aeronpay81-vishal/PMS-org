import { useEffect, useRef, useState } from "react";
import { aiClient } from "../api/aiClient";

const QUICK_PROMPTS = [
  "How can I manage my projects better?",
  "Help me create a project plan",
  "How do I use subtasks?",
  "Give me productivity tips",
];

const INITIAL_MESSAGE = {
  id: 1,
  role: "assistant",
  content:
    "Hi! I'm AeroPilot AI 👋 How can I help you manage your projects, tasks, and team more efficiently?",
};

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  const sendMessage = async (text = message) => {
    const cleanMessage = text.trim();

    if (!cleanMessage || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: cleanMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsLoading(true);

    try {
      const reply = await aiClient.ask(cleanMessage, []);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: reply,
        },
      ]);
    } catch (error) {
      console.error("AI Assistant Error:", error);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          isError: true,
          content:
            error?.message ||
            "Sorry, I'm having trouble connecting right now. Please add your Groq API key in the frontend .env file and try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <>
      {/* ================= FLOATING AI BUTTON ================= */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AeroPilot AI"
          className="
            fixed bottom-6 right-6 z-[999]
            group flex h-12 w-12 items-center justify-center
            rounded-[20px]
            bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600
            text-white
            shadow-[0_18px_45px_-12px_rgba(79,70,229,.65)]
            transition-all duration-300
            hover:-translate-y-1
            hover:scale-105
            hover:shadow-[0_25px_55px_-12px_rgba(79,70,229,.75)]
            active:scale-95
          "
        >
          {/* Glow */}
          <span
            className="
              absolute inset-0 rounded-[20px]
              bg-indigo-500 opacity-30 blur-xl
              transition-opacity duration-300
              group-hover:opacity-50
            "
          />

          <span className="relative flex flex-col items-center">
           <span className="text-[32px] leading-none font-semibold">✦</span>
            <span className="mt-0.5 text-[7px] font-bold tracking-widest">
          
            </span>
          </span>

          {/* Online indicator */}
          <span
            className="
              absolute -right-0.5 -top-0.5
              h-4 w-4 rounded-full
              border-[3px] border-white
              bg-emerald-500
            "
          />
        </button>
      )}

      {/* ================= AI CHAT ================= */}
      {isOpen && (
        <div
          className="
            fixed bottom-5 right-5 z-[999]
            flex w-[calc(100vw-32px)] max-w-[410px]
            flex-col overflow-hidden
            rounded-[28px]
            border border-slate-200/80
            bg-white
            shadow-[0_30px_90px_-25px_rgba(15,23,42,.35)]
            sm:bottom-6 sm:right-6
          "
          style={{
            height: "min(680px, calc(100vh - 48px))",
          }}
        >
          {/* ================= HEADER ================= */}
          <div
            className="
              relative overflow-hidden
              border-b border-white/10
              bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900
              px-5 py-4
              text-white
            "
          >
            {/* Header glow */}
            <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-violet-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 left-10 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* AI Logo */}
                <div
                  className="
                    flex h-11 w-11 items-center justify-center
                    rounded-[14px]
                    border border-white/15
                    bg-white/10
                    shadow-lg
                    backdrop-blur
                  "
                >
                 <span className="text-[28px] leading-none font-semibold">✦</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-bold tracking-tight">
                      AeroPilot AI
                    </h3>

                    <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-emerald-300">
                      Online
                    </span>
                  </div>

                  <p className="mt-0.5 text-[11px] text-slate-300">
                    Your intelligent project copilot
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clearChat}
                  title="Clear chat"
                  className="
                    flex h-9 w-9 items-center justify-center
                    rounded-xl text-slate-300
                    transition hover:bg-white/10 hover:text-white
                  "
                >
                  ↻
                </button>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                  className="
                    flex h-9 w-9 items-center justify-center
                    rounded-xl text-lg text-slate-300
                    transition hover:bg-white/10 hover:text-white
                  "
                >
                  ×
                </button>
              </div>
            </div>
          </div>

          {/* ================= CHAT BODY ================= */}
          <div
            className="
              flex-1 overflow-y-auto
              bg-[linear-gradient(to_bottom,#fafbff,#ffffff)]
              px-4 py-5
            "
          >
            {/* Welcome label */}
            {messages.length === 1 && (
              <div className="mb-5 text-center">
                <span
                  className="
                    inline-flex items-center gap-1.5
                    rounded-full border border-indigo-100
                    bg-indigo-50/70 px-3 py-1.5
                    text-[9px] font-semibold text-indigo-600
                  "
                >
                  ✦ AI-powered workspace assistant
                </span>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((item) => (
                <div
                  key={item.id}
                  className={`flex ${
                    item.role === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {item.role === "assistant" && (
                    <div
                      className="
                        mr-2 flex h-8 w-8 shrink-0
                        items-center justify-center
                        rounded-xl
                        bg-gradient-to-br from-indigo-600 to-violet-600
                        text-sm text-white
                        shadow-md shadow-indigo-500/20
                      "
                    >
                      ✦
                    </div>
                  )}

                  <div
                    className={`
                      max-w-[78%]
                      px-4 py-3
                      text-[13px]
                      leading-5
                      ${
                        item.role === "user"
                          ? `
                            rounded-[18px] rounded-br-md
                            bg-gradient-to-r
                            from-indigo-600 to-violet-600
                            text-white
                            shadow-md shadow-indigo-500/15
                          `
                          : `
                            rounded-[18px] rounded-bl-md
                            border border-slate-100
                            bg-white
                            text-slate-600
                            shadow-[0_6px_25px_-15px_rgba(15,23,42,.25)]
                          `
                      }
                      ${item.isError ? "border-red-100 bg-red-50 text-red-600" : ""}
                    `}
                  >
                    {item.content}
                  </div>
                </div>
              ))}

              {/* Loading */}
              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="
                      mr-2 flex h-8 w-8 shrink-0
                      items-center justify-center
                      rounded-xl
                      bg-gradient-to-br from-indigo-600 to-violet-600
                      text-sm text-white
                    "
                  >
                    ✦
                  </div>

                  <div
                    className="
                      flex items-center gap-1.5
                      rounded-[18px] rounded-bl-md
                      border border-slate-100
                      bg-white px-4 py-3
                      shadow-sm
                    "
                  >
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500" />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-violet-500"
                      style={{ animationDelay: "120ms" }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-500"
                      style={{ animationDelay: "240ms" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ================= QUICK PROMPTS ================= */}
            {messages.length === 1 && !isLoading && (
              <div className="mt-6">
                <p className="mb-2.5 px-1 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Try asking
                </p>

                <div className="grid grid-cols-1 gap-2">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="
                        group flex items-center justify-between
                        rounded-xl border border-slate-200/80
                        bg-white px-3.5 py-3
                        text-left text-[11px] font-medium text-slate-600
                        transition-all duration-200
                        hover:-translate-y-0.5
                        hover:border-indigo-200
                        hover:bg-indigo-50/50
                        hover:text-indigo-700
                        hover:shadow-sm
                      "
                    >
                      <span>{prompt}</span>

                      <span
                        className="
                          ml-3 text-slate-300
                          transition group-hover:translate-x-1
                          group-hover:text-indigo-500
                        "
                      >
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ================= INPUT ================= */}
          <div className="border-t border-slate-100 bg-white p-4">
            <div
              className="
                flex items-end gap-2
                rounded-[18px]
                border border-slate-200
                bg-slate-50/70
                p-2
                transition
                focus-within:border-indigo-300
                focus-within:bg-white
                focus-within:ring-4
                focus-within:ring-indigo-500/[0.06]
              "
            >
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask AeroPilot AI anything..."
                disabled={isLoading}
                className="
                  max-h-24 min-h-[38px] flex-1
                  resize-none
                  bg-transparent
                  px-2 py-2
                  text-[13px]
                  text-slate-800
                  outline-none
                  placeholder:text-slate-400
                  disabled:opacity-50
                "
              />

              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!message.trim() || isLoading}
                className="
                  flex h-10 w-10 shrink-0
                  items-center justify-center
                  rounded-xl
                  bg-gradient-to-br from-indigo-600 to-violet-600
                  text-white
                  shadow-md shadow-indigo-500/20
                  transition
                  hover:-translate-y-0.5
                  hover:shadow-lg
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
                aria-label="Send message"
              >
                →
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between px-1">
              <p className="text-[8px] text-slate-400">
                AeroPilot AI can make mistakes. Verify important information.
              </p>

              <span className="hidden text-[8px] font-medium text-slate-300 sm:block">
                Enter ↵
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= ANIMATION ================= */}
      <style>{`
        @keyframes aeroAiPop {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes aeroAiFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }

        .aero-ai-widget {
          animation: aeroAiPop .25s ease-out;
        }
      `}</style>
    </>
  );
}