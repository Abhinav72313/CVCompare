import { useEffect, useState } from "react";
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

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setPdfUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    // Highlight specific words inside the rendered text layer
    const highlightText = (text: string): string[] => {
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
    };

    return (
        <div className="w-full max-h-[calc(100vh-100px)] overflow-auto">
            {pdfUrl && (
                <Document file={pdfUrl} onLoadSuccess={(pdf) => setNumPages(pdf.numPages)}>
                    {Array.from({ length: numPages }, (_, index) => (
                        <Page
                            key={`page_${index + 1}`}
                            scale={1.1}
                            pageNumber={index + 1}
                            renderAnnotationLayer={false}
                            customTextRenderer={({ str }) => {
                                const s = highlightText(str).join('');
                                return s;
                            }}
                        />
                    ))}
                </Document>
            )}
        </div>
    );
}
