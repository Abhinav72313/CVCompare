'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

type FileContextType = {
    file: File|undefined;
    resumeHash: string | null;
    jdHash: string | null;
    setResumeHash: React.Dispatch<React.SetStateAction<string | null>>;
    setJDHash: React.Dispatch<React.SetStateAction<string | null>>;
    setFiles: React.Dispatch<React.SetStateAction<File|undefined>>;
};

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
    const [files, setFiles] = useState<File|undefined>();
    const [resumeHash, setResumeHash] = useState<string | null>(null);
    const [jdHash, setJDHash] = useState<string | null>(null);

    return (
        <FileContext.Provider value={{ file: files, setFiles, resumeHash, setResumeHash, jdHash, setJDHash }}>
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