"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Trash2,
  Sparkles,
  Bot,
  User,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { Markdown } from "@/components/ui/Markdown";
import { apiPost } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  "What are healthy ways to manage high stress?",
  "How can I safely improve my resting heart rate?",
  "Nutritional guidance for managing type 2 diabetes",
  "Gentle exercises for lower back pain relief",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("hs_chat_history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        initializeDefaultChat();
      }
    } else {
      initializeDefaultChat();
    }
  }, []);

  const initializeDefaultChat = () => {
    const initial: ChatMessage[] = [
      {
        id: "intro-1",
        role: "assistant",
        content: `Hello! I am **HealthSync AI**, your personal health intelligence companion powered by Google Gemini. 🩺

I can help explain clinical concepts, lifestyle choices, workout principles, and dietary considerations. 

*Always consult licensed healthcare practitioners for specific diagnoses or urgent clinical decisions.* 

How can I assist you with your health today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    setMessages(initial);
  };

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("hs_chat_history", JSON.stringify(messages));
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const query = (messageText || input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const data = await apiPost<{ response: string }>("/api/chat", { message: query });

      const botMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Service temporarily unavailable.";
      toast(msg, "error");

      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ *We encountered an error connecting to the health reasoning model:* ${msg}. Please verify the backend connection.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem("hs_chat_history");
    initializeDefaultChat();
    toast("Chat history cleared.", "info");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-950 border border-primary-800 flex items-center justify-center text-primary-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              HealthSync AI Assistant
              <span className="badge badge-green text-[10px] py-0">Online</span>
            </h1>
            <p className="text-xs text-gray-400">Powered by Google Gemini 1.5</p>
          </div>
        </div>

        <button
          onClick={handleClearHistory}
          className="btn-outline text-xs px-3 py-1.5 flex items-center gap-1.5"
          title="Clear Conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${
              m.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                m.role === "user"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-800 border border-gray-700 text-primary-400"
              }`}
            >
              {m.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 ${
                m.role === "user"
                  ? "bg-primary-950/60 border border-primary-800/80 text-white"
                  : "bg-gray-900 border border-gray-800 text-gray-200"
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className="text-[11px] font-semibold text-gray-400">
                  {m.role === "user" ? "You" : "HealthSync Assistant"}
                </span>
                <span className="text-[10px] text-gray-500">{m.timestamp}</span>
              </div>
              <Markdown content={m.content} />
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-primary-400 flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-2">
              <span className="text-xs text-gray-400">Consulting health model</span>
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      {messages.length <= 2 && (
        <div className="py-3 flex flex-wrap gap-2 flex-shrink-0">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800 text-gray-300 hover:border-primary-600 hover:text-white transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="pt-3 border-t border-gray-800 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-2xl p-1.5 focus-within:border-primary-500 transition-colors"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about symptoms, lab results, medications, lifestyle..."
            className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white focus:outline-none placeholder:text-gray-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn-primary p-2.5 rounded-xl disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <p className="text-[11px] text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
          <span>HealthSync provides educational insights. For emergencies, please call local emergency services.</span>
        </p>
      </div>
    </div>
  );
}
