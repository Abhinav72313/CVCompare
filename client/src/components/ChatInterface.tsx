"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useFileContext } from "@/contexts/fileContext";
import { useSession } from "@/contexts/sessionContext";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from 'react';

interface ChatMessage {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatInterfaceProps {
    className?: string;
}

export default function ChatInterface({ className }: ChatInterfaceProps) {
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        {
            id: '1',
            type: 'assistant',
            content: 'Hello! I\'m here to help you improve your resume. You can ask me questions about your analysis results, request specific improvements, or get advice on tailoring your resume for this job.',
            timestamp: new Date()
        }
    ]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const {sessionId} = useSession()
    const {resumeHash, jdHash} = useFileContext()

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const handleSendMessage = async () => {
        if (!currentMessage.trim() || isLoading) return;
        
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: currentMessage,
            timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, userMessage]);
        setCurrentMessage('');
        setIsLoading(true);

        const res = await fetch('http://localhost:8000/chat',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: sessionId, // Replace with actual session ID
                message: currentMessage,
                resume_hash: resumeHash, // Pass the resume hash
                jd_hash: jdHash // Pass the job description hash
            }),
        })

        if(res.ok){
            const response = await res.json();
            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: response.response,
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, aiResponse]);
            setIsLoading(false);
        }else{
            const errorResponse = "Failed to fetch response from the server. Please try again later.";
            const aiResponse: ChatMessage = {
                id: (Date.now() + 1).toString(),
                type: 'assistant',
                content: errorResponse,
                timestamp: new Date()
            };
            setChatMessages(prev => [...prev, aiResponse]);
            setIsLoading(false);
        }
        
   };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Card className={`h-full flex flex-col ${className}`}>
            <CardHeader>
                <CardTitle className="text-lg">Resume Assistant</CardTitle>
            </CardHeader>            <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-scroll max-h-screen p-4 space-y-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300">
                    {chatMessages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                    message.type === 'user'
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-900'
                                }`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                                }`}>
                                    {message.timestamp.toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 text-gray-900 max-w-[80%] rounded-lg p-3">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
