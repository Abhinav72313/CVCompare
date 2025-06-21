import { useCallback, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// PDF.js worker configuration
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Props = {
    file: File;
    highlightWords: string[];
};

export default function PdfHighlighter({ file, highlightWords }: Props) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);    useEffect(() => {
        if (!file) {
            setError("No file provided");
            return;
        }
        
        setError(null);
        const url = URL.createObjectURL(file);
        setPdfUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    // Memoize the highlight function to prevent unnecessary re-renders
    const highlightText = useCallback((text: string): string[] => {
        if (!highlightWords.length) return [text];

        const parts: string[] = [];
        let remaining = text;

        while (remaining) {
            // Use word boundaries (\b) to match whole words only
            const regex = new RegExp(
                `\\b(${highlightWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`,
                "i"
            );
            const match = regex.exec(remaining);

            if (!match) {
                parts.push(`<span key={${Math.random()}}>${remaining}</span>`);
                break;
            }

            const start = match.index;
            const end = start + match[0].length;

            if (start > 0) parts.push(remaining.slice(0, start));
            parts.push(
                `<mark style="background-color:lightgreen" key={${Math.random()}}>${remaining.slice(start, end)}</mark>`
            );

            remaining = remaining.slice(end);
        }

        return parts;
    }, [highlightWords]);    return (
        <div className="w-full max-h-[calc(100vh-100px)] overflow-auto">
            {error && (
                <div className="p-4 text-red-600 bg-red-50 rounded-md">
                    Error loading PDF: {error}
                </div>
            )}
            {pdfUrl && !error && (
                <Document 
                    file={pdfUrl} 
                    onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}
                    onLoadError={(error) => setError(error.message)}
                    loading={<div className="p-4 text-gray-600">Loading PDF...</div>}
                >
                    {Array.from({ length: numPages }, (_, index) => (
                        <Page
                            key={`page_${index + 1}`}
                            scale={1.1}
                            pageNumber={index + 1}
                            renderAnnotationLayer={false}
                            renderTextLayer={true}
                            customTextRenderer={({ str }) => {
                                try {
                                    const s = highlightText(str).join('');
                                    return s;
                                } catch (err) {
                                    console.warn('Text rendering error:', err);
                                    return str;
                                }
                            }}
                            onRenderError={(error) => {
                                console.warn('Page render error:', error);
                                // Don't set global error for individual page errors
                            }}
                        />
                    ))}
                </Document>
            )}
        </div>
    );
}
