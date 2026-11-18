import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  ShieldAlert,
  Loader2,
  Copy,
  Check,
  RotateCcw,
} from "lucide-react";
import { AQIDataResponse, Message } from "../types";
import { api } from "../services/api";

interface AIAssistantPageProps {
  aqiData: AQIDataResponse | null;
  city: string;
}

const LIFESTYLE_PERSONAS = [
  "Parent",
  "Working Professional",
  "Senior Citizen",
  "Student",
  "Fitness Enthusiast",
  "Outdoor Worker",
];

const PROMPT_CHIPS = [
  "Is it safe to go outside right now?",
  "When should my children play outdoors today?",
  "What mask should I use during severe winter smog?",
  "Should I exercise outdoors today or workout inside?",
  "How can I improve my indoor bedroom air quality?",
  "What can I do today to reduce my pollution contribution?",
];

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ aqiData, city }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your AirVeda assistant. I can use current modelled air-quality data when available and will say when readings are unavailable. How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("Parent");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const newMessages: Message[] = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const resp = await api.sendChatMessage({
        message: query,
        city,
        aqi: aqiData?.cpcb_aqi,
        category: aqiData?.cpcb_category,
        pm2_5: aqiData?.pollutants.pm2_5.value,
        lifestyle: selectedPersona,
        history: messages.slice(-6),
      });

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: resp.reply,
        },
      ]);
    } catch {
      setError("The assistant could not be reached. Please retry; no substitute air-quality values were used.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleResetChat = () => {
    setError(null);
    setMessages([
      {
        role: "assistant",
        content: aqiData
          ? `Conversation reset. I am ready to help with current modelled conditions for ${aqiData.city}.`
          : "Conversation reset. Current location readings are unavailable, so I will avoid location-specific claims.",
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                Gemini when configured • Expert guidance fallback
              </span>
              <span className="text-xs text-emerald-300">• With Expert Fallback Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight">
              AI Smart Pollution Assistant
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Context-aware environmental guidance based on available modelled air-quality data and your daily routine.
            </p>
          </div>

          <button
            onClick={handleResetChat}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            aria-label="Reset conversation history"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Current Context Pill & Lifestyle Selector */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-300 font-semibold">Current model context:</span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 font-bold text-white">
              {aqiData ? `${aqiData.city} • CPCB NAQI ${aqiData.cpcb_aqi} (${aqiData.cpcb_category})` : "Current reading unavailable"}
            </span>
          </div>

          {/* Persona Dropdown/Selector */}
          <div className="flex items-center gap-2">
            <label htmlFor="persona-select" className="text-xs font-semibold text-emerald-200">
              Lifestyle:
            </label>
            <select
              id="persona-select"
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="bg-emerald-950/80 border border-emerald-600/50 rounded-xl px-3 py-1 text-xs font-bold text-white outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {LIFESTYLE_PERSONAS.map((p) => (
                <option key={p} value={p} className="bg-slate-900 text-white">
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Suggested Questions Horizontal Chips */}
      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{error}</p>}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block font-['Outfit']">
          Suggested Inquiries
        </span>
        <div className="flex flex-wrap gap-2">
          {PROMPT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              disabled={isLoading}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 font-medium transition-all shadow-sm focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div
        className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-sm min-h-[380px] max-h-[580px] overflow-y-auto space-y-4"
        role="log"
        aria-live="polite"
        aria-label="AI Assistant Chat History"
      >
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div
              key={idx}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-white ${
                  isUser
                    ? "bg-slate-800"
                    : "bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-sm"
                }`}
                aria-hidden="true"
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed relative group ${
                  isUser
                    ? "bg-slate-900 text-white rounded-tr-none"
                    : "bg-slate-50 border border-slate-200/80 text-slate-800 rounded-tl-none"
                }`}
              >
                {/* Content with basic bold formatting */}
                <div className="whitespace-pre-wrap space-y-1">
                  {m.content.split("\n").map((line, i) => {
                    return (
                      <p key={i}>
                        {line}
                      </p>
                    );
                  })}
                </div>

                {!isUser && (
                  <button
                    onClick={() => handleCopy(m.content, idx)}
                    className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200 opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
                    aria-label="Copy assistant answer"
                    title="Copy to clipboard"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 text-slate-400 text-sm italic py-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>Analyzing air quality context & formulating health advice...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2"
      >
        <label htmlFor="ai-chat-input" className="sr-only">
          Ask a question about smog and air safety
        </label>
        <input
          id="ai-chat-input"
          type="text"
          value={inputValue}
          maxLength={1500}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question (e.g., Should my asthmatic child attend outdoor PE today?)..."
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-emerald-600/20 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none"
          aria-label="Send query to AI Assistant"
        >
          <span>Send</span>
          <Send className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>

      {/* Safety Notice */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-100 text-xs text-slate-500 border border-slate-200">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          <strong>Medical Disclaimer:</strong> This assistant provides environmental air pollution recommendations based on CPCB NAQI standards. It does not provide medical diagnoses or prescriptions. In respiratory emergencies, contact emergency medical care immediately.
        </p>
      </div>
    </div>
  );
};
