import JSZip from "jszip";
import type {FileItem} from "../schemas/file-schemas.ts";

export function isArchive(file: File): boolean {
    const fileName: string = file.name;
    const fileType: string = file.type;
    return fileType.startsWith("application/zip") ||
        fileType.startsWith("application/x-zip-compressed") ||
        fileName.toLowerCase().endsWith(".zip");
}

export function isImageByFileType(file: File) {
    return file.type.startsWith("image")
}

export async function generateArchive(fileItems: FileItem[]): Promise<Blob> {
    const zip = new JSZip();

    for (const item of fileItems) {
        const file: File = item.file;
        const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
        zip.file(file.name, arrayBuffer);
    }

    return await zip.generateAsync({ type: "blob" });
}

export function blobToZip(blob: Blob, archiveName: string): File {
    return new File([blob], archiveName, { type: "application/zip" });
}

export function blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, { type: blob.type });
}

export function isImageByFileName(fileName: string) {
    return fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)
}
