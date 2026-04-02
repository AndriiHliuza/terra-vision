import JSZip from "jszip";
import type {FileItem} from "../schemas/file-schemas.ts";



/* <<<<<<<<<<<< isArchive >>>>>>>>>>>> */

export function isArchive(file: File): boolean {
    return file.type.startsWith("application/zip") ||
        file.type.startsWith("application/x-zip-compressed") ||
        file.name.toLowerCase().endsWith(".zip");
}



/* <<<<<<<<<<<< isImage >>>>>>>>>>>> */

export function isImageByFileName(fileName: string) {
    return fileName.toLowerCase().match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)
}

export function isImageByFileType(file: File) {
    return file.type.startsWith("image")
}



/* <<<<<<<<<<<< generateArchive >>>>>>>>>>>> */

export async function generateArchive(fileItems: FileItem[]): Promise<Blob> {
    const zip = new JSZip();

    for (const item of fileItems) {
        const file: File = item.file;
        const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
        zip.file(file.name, arrayBuffer);
    }

    return await zip.generateAsync({ type: "blob" });
}



/* <<<<<<<<<<<< blobTo... >>>>>>>>>>>> */

export function blobToZip(blob: Blob, archiveName: string): File {
    return new File([blob], archiveName, { type: "application/zip" });
}

export function blobToFile(blob: Blob, fileName: string): File {
    return new File([blob], fileName, { type: blob.type });
}
