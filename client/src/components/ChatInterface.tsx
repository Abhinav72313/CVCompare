"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useFileContext } from "@/contexts/fileContext";
import { useAuthenticatedFetch } from "@/hooks/useAuthenticatedFetch";
import { useUser } from "@clerk/nextjs";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";

interface ChatInterfaceProps {
  className?: string;
}

export default function ChatInterface({ className }: ChatInterfaceProps) {
  const { chatHistory, setChatHistory } = useFileContext();
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [clearIsLoading, setClearIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const authfetch = useAuthenticatedFetch();
  const { resumeHash, jdHash } = useFileContext();
  const { user } = useUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleClearChat = async () => {
    if (!user) return alert("Please sign in to clear chat");

    setClearIsLoading(true);

    const res = await authfetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/clear`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          resume_hash: resumeHash, // Pass the resume hash
          jd_hash: jdHash, // Pass the job description hash
        }),
      }
    );

    if (res.ok) {
      setChatHistory([{
        id: Date.now().toString(),
        role: "assistant",
        message: "Welcome to the ATS analysis chat! You can ask me questions about your resume and job description.",
        created_at: new Date(),
        user_id: null,
        resume_hash: resumeHash,
        jd_hash: jdHash
      }]);
    }

    setClearIsLoading(false);
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isLoading) return;

    if (!user) return alert("Please sign in to chat");

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      message: currentMessage,
      created_at: new Date(),
      user_id: null,
      resume_hash: null,
      jd_hash: null,
    };

    setChatHistory((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    const res = await authfetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/chat/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id, // Replace with actual session ID
          message: currentMessage,
          resume_hash: resumeHash, // Pass the resume hash
          jd_hash: jdHash, // Pass the job description hash
        }),
      }
    );

    if (res.ok) {
      const response = await res.json();
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        message: response.response,
        created_at: new Date(),
        user_id: null,
        resume_hash: null,
        jd_hash: null,
      };
      setChatHistory((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    } else {
      const errorResponse =
        "Failed to fetch response from the server. Please try again later.";
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        message: errorResponse,
        created_at: new Date(),
        user_id: null,
        resume_hash: null,
        jd_hash: null,
      };
      setChatHistory((prev) => [...prev, aiResponse]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="border-b-2">
        <CardTitle className="text-lg  flex justify-between">
          <p>
            Resume Assistant
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearChat}
            disabled={isLoading || clearIsLoading}
          >
            Clear Chat
          </Button>

        </CardTitle>
      </CardHeader>{" "}
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-scroll max-h-screen p-4 space-y-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
          {chatHistory.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={` rounded-lg p-3 ${message.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-900 "
                  }`}
              >
                <div className="text-sm whitespace-pre-wrap">
                  <Markdown>{message.message}</Markdown>
                </div>
                <p
                  className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                >
                  {message.created_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-900 max-w-[80%] rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about your resume ..."
              className="flex-1 min-h-[40px] max-h-[120px] resize-none"
              rows={1}
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || isLoading}
              size="icon"
              className="h-10 w-10 flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
