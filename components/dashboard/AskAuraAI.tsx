"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import api from "@/lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AppSidebar from "@/components/dashboard/AppSidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getUser } from "@/lib/auth";
import {
  Bot,
  CheckCheck,
  ChevronDown,
  Clock,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  User,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface Conversation {
  id: number;
  /** Backend may return a title/preview — fall back to first message snippet */
  title?: string;
  preview?: string;
  created_at?: string;
}

const BASE = "";

// ─── Component ────────────────────────────────────────────────────────────────

export default function AskAuraAI() {
  const user = getUser();
  const userName = user?.fullname || "User";

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);

  // Sidebar / history state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Scroll helpers ──────────────────────────────────────────────────────────
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // ── Load conversation list ──────────────────────────────────────────────────
  const loadConversations = useCallback(async () => {
    if (!user?.id) return;
    setLoadingHistory(true);
    try {
      const res = await api.get<Conversation[]>(`${BASE}/chat/conversations/${user.id}`);
      setConversations(res.data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoadingHistory(false);
    }
  }, [user?.id]);

  // Load history when sidebar opens
  useEffect(() => {
    if (historyOpen) loadConversations();
  }, [historyOpen, loadConversations]);

  // ── On mount: auto-load the most recent conversation ───────────────────────
  useEffect(() => {
    if (!user?.id) return;
    api
      .get<Conversation[]>(`${BASE}/chat/conversations/${user.id}`)
      .then((res) => {
        const list = res.data;
        setConversations(list);
        if (list.length === 0) return;
        // Pick the last item (most recent)
        const latest = list[list.length - 1];
        openConversation(latest.id);
      })
      .catch((err) => console.error("Failed to auto-load latest conversation:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Load messages for a past conversation ──────────────────────────────────
  const openConversation = async (convId: number) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await api.get<any[]>(`${BASE}/chat/conversations/${convId}/messages`);
      const mapped: Message[] = res.data.map((m) => ({
        id: String(m.id ?? Math.random()),
        sender: m.role === "user" || m.sender === "user" ? "user" : "ai",
        text: m.content ?? m.text ?? m.message ?? "",
        timestamp: m.created_at
          ? new Date(m.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
      }));
      setMessages(mapped);
      setConversationId(convId);
      setHistoryOpen(false);
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  // ── Delete conversation ─────────────────────────────────────────────────────
  const deleteConversation = async (convId: number) => {
    setDeletingId(convId);
    try {
      await api.delete(`${BASE}/chat/conversations/${convId}`);
      setConversations((prev) => prev.filter((c) => c.id !== convId));
      // If we're currently viewing the deleted conversation, clear the chat
      if (conversationId === convId) {
        setMessages([]);
        setConversationId(null);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Start a new chat ────────────────────────────────────────────────────────
  const startNewChat = () => {
    setMessages([]);
    setConversationId(null);
    setHistoryOpen(false);
  };

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputMessage.trim();
    if (!trimmed || isTyping || !user?.id) return;

    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Append user message immediately
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), sender: "user", text: trimmed, timestamp: now },
    ]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const res = await api.post<{ conversationId: number; answer: string }>(`${BASE}/chat/`, {
        userId: user.id,
        question: trimmed,
        conversationId: conversationId, // null on first message
      });

      const data = res.data;

      // Persist the conversation ID for follow-up messages
      setConversationId(data.conversationId);

      const aiTime = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: data.answer,
          timestamp: aiTime,
        },
      ]);
    } catch (err) {
      console.error("Chat request failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "Sorry, I couldn't reach the server. Please try again.",
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-[#f8fafc] flex flex-col h-screen overflow-hidden">

        {/* ── Top Header ── */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-4 md:px-6 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="h-4 hidden sm:block" />
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs">
                <MessageSquare className="size-5 fill-current" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  Ask Aura AI
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Your AI health assistant, here to help with your reports and questions.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* New Chat button */}
            <button
              onClick={startNewChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Start new conversation"
            >
              <Plus className="size-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>

            {/* History button */}
            <button
              onClick={() => setHistoryOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="View conversation history"
            >
              <Clock className="size-3.5" />
              <span className="hidden sm:inline">History</span>
            </button>

            {/* User pill */}
            <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 px-2.5 rounded-full transition-colors">
              <div className="size-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-medium text-xs">
                <User className="size-4" />
              </div>
              <span className="text-sm font-medium text-slate-800 hidden sm:inline">
                {userName}
              </span>
              <ChevronDown className="size-4 text-slate-400" />
            </div>
          </div>
        </header>

        {/* ── Chat Area ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Welcome Banner */}
            <div className="rounded-2xl border border-teal-100 bg-[#edfcf8]/85 p-5 md:p-6 shadow-xs">
              <div className="flex items-start gap-4">
                <div className="size-11 rounded-2xl bg-teal-100/90 border border-teal-200/80 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="size-6" />
                </div>
                <div className="space-y-1.5 text-sm">
                  <h2 className="font-semibold text-slate-900 text-base">
                    Hello! I&apos;m Aura AI
                  </h2>
                  <p className="text-slate-600 leading-relaxed">
                    I can help you understand your health reports, answer your questions,
                    and provide personalized insights and suggestions based on your data.
                  </p>
                  <p className="text-slate-600 leading-relaxed pt-1">
                    Feel free to ask me anything about your health, reports, or trends.
                  </p>
                </div>
              </div>
            </div>

            {/* Message Stream */}
            <div className="space-y-6 pt-2">
              {messages.map((message) => {
                if (message.sender === "user") {
                  return (
                    <div key={message.id} className="flex flex-col items-end gap-1">
                      <div className="bg-[#d5f5eb] text-slate-800 rounded-2xl rounded-tr-xs px-5 py-3 max-w-lg shadow-xs text-sm md:text-lg leading-relaxed">
                        {message.text}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 pr-1">
                        <span>{message.timestamp}</span>
                        <CheckCheck className="size-3.5 text-teal-600" />
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={message.id} className="flex items-start gap-3 max-w-2xl">
                    <div className="size-9 rounded-full bg-teal-100 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="size-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs p-4 shadow-xs text-sm md:text-lg text-slate-700 leading-relaxed">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Headings
                            h1: ({ children }) => <h1 className="text-base font-bold text-slate-900 mb-2 mt-1">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-sm font-bold text-slate-900 mb-1.5 mt-3 first:mt-0">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-sm font-semibold text-slate-800 mb-1 mt-2 first:mt-0">{children}</h3>,
                            // Paragraphs
                            p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                            // Bold / Italic
                            strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                            em: ({ children }) => <em className="italic text-slate-600">{children}</em>,
                            // Lists
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-2 pl-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-2 pl-1">{children}</ol>,
                            li: ({ children }) => <li className="text-slate-700 leading-relaxed">{children}</li>,
                            // Table
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-3 rounded-xl border border-slate-200">
                                <table className="w-full text-xs border-collapse">{children}</table>
                              </div>
                            ),
                            thead: ({ children }) => <thead className="bg-teal-50 text-teal-800">{children}</thead>,
                            tbody: ({ children }) => <tbody className="divide-y divide-slate-100">{children}</tbody>,
                            tr: ({ children }) => <tr className="even:bg-slate-50/60">{children}</tr>,
                            th: ({ children }) => <th className="px-3 py-2 text-left font-semibold text-teal-700 whitespace-nowrap">{children}</th>,
                            td: ({ children }) => <td className="px-3 py-2 text-slate-700 align-top">{children}</td>,
                            // Horizontal rule
                            hr: () => <hr className="border-slate-200 my-3" />,
                            // Inline code
                            code: ({ children }) => (
                              <code className="bg-slate-100 text-teal-700 px-1.5 py-0.5 rounded text-xs font-mono">
                                {children}
                              </code>
                            ),
                            // Blockquote
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-teal-400 pl-3 text-slate-500 italic my-2">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-2">
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start gap-3 max-w-2xl">
                  <div className="size-9 rounded-full bg-teal-100 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="size-5" />
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-teal-400 animate-bounce" />
                    <span className="size-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="size-2 rounded-full bg-teal-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* ── Input Bar ── */}
        <div className="p-4 md:px-8 bg-transparent shrink-0">
          <form
            onSubmit={handleSendMessage}
            className="max-w-4xl mx-auto flex items-center bg-white rounded-full border border-slate-200 shadow-sm p-1.5 pl-6 pr-2 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isTyping}
              className="size-10 rounded-full bg-teal-500 hover:bg-teal-600 disabled:opacity-40 disabled:hover:bg-teal-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-xs shrink-0 cursor-pointer disabled:cursor-not-allowed"
              title="Send Message"
            >
              <Send className="size-4.5 -ml-0.5" />
            </button>
          </form>
        </div>

        {/* ── History Drawer ── */}
        {historyOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setHistoryOpen(false)}
            />

            {/* Panel */}
            <div className="relative ml-auto w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Clock className="size-4 text-teal-600" />
                  <h2 className="font-bold text-slate-900 text-sm">Conversation History</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={startNewChat}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    New Chat
                  </button>
                  <button
                    onClick={() => setHistoryOpen(false)}
                    className="size-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="size-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <MessageSquare className="size-8 mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-medium">No conversations yet</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`group flex items-center justify-between gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
                        conversationId === conv.id
                          ? "border-teal-200 bg-teal-50"
                          : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                      }`}
                      onClick={() => openConversation(conv.id)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="size-8 rounded-lg bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-600 shrink-0">
                          <MessageSquare className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {conv.title ?? conv.preview ?? `Conversation #${conv.id}`}
                          </p>
                          {conv.created_at && (
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(conv.created_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        type="button"
                        disabled={deletingId === conv.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                        className="size-7 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer opacity-0 group-hover:opacity-100 shrink-0 disabled:opacity-50"
                        title="Delete conversation"
                      >
                        {deletingId === conv.id ? (
                          <span className="size-3 border border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </SidebarInset>
    </SidebarProvider>
  );
}
