'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

type FileContextType = {
    resumeHash: string | null;
    jdHash: string | null;
    setResumeHash: React.Dispatch<React.SetStateAction<string | null>>;
    setJDHash: React.Dispatch<React.SetStateAction<string | null>>;
    chatHistory: ChatMessage[];
    setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
};

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
    const [resumeHash, setResumeHash] = useState<string | null>(null);
    const [jdHash, setJDHash] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

    return (
        <FileContext.Provider value={{  resumeHash, setResumeHash, jdHash, setJDHash ,chatHistory,setChatHistory}}>
            {children}
        </FileContext.Provider>
    );
};

export const useFileContext = () => {
    const context = useContext(FileContext);
    if (!context) {
        throw new Error('useFileContext must be used within a FileProvider');
    }
    return context;
};