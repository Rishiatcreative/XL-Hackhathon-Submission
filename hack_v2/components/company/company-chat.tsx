"use client";

import React, { useState, useEffect, useRef } from "react";
import { Company } from "@/types/company";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, RotateCw, Sparkles, Send, BrainCircuit, User } from "lucide-react";

interface CompanyChatProps {
  company: Company;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function CompanyChat({ company }: CompanyChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested Actions Menu
  const suggestions = [
    { label: "Explain ICP Score", prompt: "Explain the ICP score breakdown and fit indicators." },
    { label: "Outreach Strategy", prompt: "Summarize target outreach strategy and best channel." },
    { label: "Personalized Email", prompt: "Write a complete personalized cold email outreach template." }
  ];

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = { role: "user", content: text, timestamp: timeStr };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      // Map frontend messages to backend schema (role, content)
      const mapped = updatedMessages.map(m => ({ role: m.role, content: m.content }));
      const response = await apiService.sendCompanyChatMessage(company.id, mapped);
      
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: response,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (error) {
      console.error("[CHAT ERROR]", error);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "I encountered a processing error. Please confirm Groq API is active and try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateMessage = async () => {
    if (messages.length < 2 || isLoading) return;
    
    // Locate last user query
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    if (!lastUserMsg) return;

    // Pop the last assistant response
    const chopped = messages.slice(0, -1);
    setMessages(chopped);
    setIsLoading(true);

    try {
      const mapped = chopped.map(m => ({ role: m.role, content: m.content }));
      const response = await apiService.sendCompanyChatMessage(company.id, mapped);
      
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: response,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } catch (error) {
      console.error("[CHAT REGEN ERROR]", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgIdx(idx);
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  const formatMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Replace **bold** format inline
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIdx = 0;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        parts.push(line.substring(lastIdx, match.index));
        parts.push(<strong key={match.index} className="font-bold text-foreground">{match[1]}</strong>);
        lastIdx = boldRegex.lastIndex;
      }
      parts.push(line.substring(lastIdx));

      if (line.trim().startsWith("* ") || line.trim().startsWith("- ")) {
        // Strip out leading bullet prefix
        const cleanContent = parts.map((part, pidx) => {
          if (typeof part === "string" && pidx === 0) {
            return part.replace(/^[-*]\s*/, "");
          }
          return part;
        });
        return (
          <li key={i} className="list-disc ml-4 my-1 text-slate-700 dark:text-slate-300">
            {cleanContent}
          </li>
        );
      }
      return (
        <p key={i} className="my-1.5 leading-relaxed text-slate-700 dark:text-slate-350">
          {parts}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col h-[520px] rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Drawer Header */}
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <div>
            <h3 className="text-xs font-bold text-foreground">Ask ProspectIQ</h3>
            <p className="text-[10px] text-muted-foreground">Dynamic RAG inference using cached lead signals</p>
          </div>
        </div>
        {messages.length >= 2 && !isLoading && (
          <button
            onClick={handleRegenerateMessage}
            className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-900 px-2 py-1 rounded transition cursor-pointer"
            title="Regenerate Last Answer"
          >
            <RotateCw className="h-3 w-3" />
            <span>Regen</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 p-4">
            <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-xs">
              <BrainCircuit className="h-5 w-5 text-indigo-500 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground">Cached RAG Assistant</h4>
              <p className="text-[11px] text-muted-foreground max-w-xs leading-normal">
                Ask specific questions about {company.company}'s qualified matches, employee estimates, or outreach strategy drafts.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div key={idx} className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
                {!isUser && (
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                    <BrainCircuit className="h-4 w-4 text-indigo-500" />
                  </div>
                )}
                
                <div className="space-y-1 max-w-[80%]">
                  <div className={`relative rounded-2xl px-4 py-2.5 text-xs border ${
                    isUser
                      ? "bg-indigo-600 text-white border-indigo-500 rounded-tr-none shadow-xs"
                      : "bg-slate-50 dark:bg-slate-900 border-border rounded-tl-none"
                  }`}>
                    {/* Copy Response overlay button */}
                    {!isUser && (
                      <button
                        onClick={() => copyToClipboard(msg.content, idx)}
                        className="absolute top-2 right-2 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        title="Copy message text"
                      >
                        {copiedMsgIdx === idx ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}

                    <div className="pr-4">{formatMessageContent(msg.content)}</div>
                  </div>
                  
                  <span className={`block text-[9px] text-muted-foreground/60 ${isUser ? "text-right" : "text-left"}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-900 border border-border flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Live Thinking Indicator */}
        {isLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <BrainCircuit className="h-4 w-4 text-indigo-500 animate-pulse" />
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-border rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-5 py-2.5 border-t border-border bg-muted/10 space-y-2">
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sug.prompt)}
              disabled={isLoading}
              className="text-[10px] bg-card border border-border hover:border-indigo-500/30 hover:bg-muted transition px-3 py-1 rounded-full text-muted-foreground hover:text-indigo-500 font-semibold cursor-pointer disabled:opacity-50"
            >
              {sug.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-border bg-muted/20 flex gap-2 items-center">
        <Input
          placeholder={`Ask about ${company.company} triggers...`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
          disabled={isLoading}
          className="text-xs h-9 focus-visible:ring-1 focus-visible:ring-primary bg-card border-border"
        />
        <Button
          size="sm"
          onClick={() => handleSendMessage(inputValue)}
          disabled={!inputValue.trim() || isLoading}
          className="h-9 px-4 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
