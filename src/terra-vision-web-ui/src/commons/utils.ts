import {
    type FileItem,
    URL_TYPE,
    type UrlType,
    urlBuilders,
    type TruncateFileNameRule
} from "./models.ts";
import JSZip from "jszip";
import {useEffect, useState} from "react";
import {SUPPORTED_LANGUAGES} from "../configs/settings.ts";

/* Archives (ZIP) and Blob */
export function isArchive(fileType: string, fileName: string): boolean {
    return fileType.startsWith("application/zip") ||
        fileType.startsWith("application/x-zip-compressed") ||
        fileName.toLowerCase().endsWith(".zip");
}

export async function createArchiveFromFileItems(fileItems: FileItem[]): Promise<Blob> {
    const zip = new JSZip();

    for (const item of fileItems) {
        const file: File = item.file;
        const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
        zip.file(file.name, arrayBuffer);
    }

    return await zip.generateAsync({ type: "blob" });
}

export function blobToZip(blob: Blob, fileName: string): File {
    return new File([blob], fileName, { type: "application/zip" });
}

export function blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, { type: blob.type });
}

export function isImage(fileName: string) {
    return fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)
}

/* URL */
export function buildUrl(
    urlSegments: string | string[],
    urlType: UrlType = URL_TYPE.ABSOLUTE
): string {
    let url: string;

    if (Array.isArray(urlSegments)) {
        const cleanedSegments = urlSegments.map(s => s.replace(/\//g, ""));
        url = cleanedSegments.filter(Boolean).join("/");
    } else {
        url = urlSegments.replace(/\//g, "");
    }

    return urlBuilders[urlType](url);
}

export function buildUrlForAllLanguages(urlSegments: string | string[], urlType: UrlType = URL_TYPE.ABSOLUTE) {
    return SUPPORTED_LANGUAGES.map(lang => {
        const segments = Array.isArray(urlSegments) ? [lang, ...urlSegments] : [lang, urlSegments];
        return buildUrl(segments, urlType);
    });
}

/* Width handlers */
/* Get current screen width even when it is changing  */
export function useScreenWidth() {
    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return width;
}

export function getTruncateFileNameLengthsByWidth(
    width: number,
    rules: TruncateFileNameRule[]
) {
    return (
        rules.find(rule => width <= rule.maxScreenWidth) ??
        rules[rules.length - 1]
    );
}

export function truncateFileName(fileName: string, startLength: number = 6, endLength: number = 9): string {
    if (fileName.length <= startLength + endLength) {
        return fileName; // no need to truncate
    }

    const start: string = fileName.substring(0, startLength);
    const end: string = fileName.substring(fileName.length - endLength);
    return `${start}...${end}`;
}

