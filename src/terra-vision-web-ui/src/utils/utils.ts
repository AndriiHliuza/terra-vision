import type {FileItem} from "./application-types.ts";
import JSZip from "jszip";

export function isArchive(fileType: string, fileName: string): boolean {
    return fileType.startsWith("application/zip") ||
        fileType.startsWith("application/x-zip-compressed") ||
        fileName.toLowerCase().endsWith(".zip");
}

export function truncateFileName(fileName: string, startLength: number = 6, endLength: number = 9): string {
    if (fileName.length <= startLength + endLength) {
        return fileName; // no need to truncate
    }

    const start: string = fileName.substring(0, startLength);
    const end: string = fileName.substring(fileName.length - endLength);
    return `${start}...${end}`;
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