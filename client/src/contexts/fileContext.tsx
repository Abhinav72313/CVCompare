'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

type FileContextType = {
    file: File|undefined;
    setFiles: React.Dispatch<React.SetStateAction<File|undefined>>;
};

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
    const [files, setFiles] = useState<File|undefined>();

    return (
        <FileContext.Provider value={{ file: files, setFiles }}>
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