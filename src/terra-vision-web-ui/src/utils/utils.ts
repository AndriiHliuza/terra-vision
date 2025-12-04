export const isArchive = (fileType: string, fileName: string): boolean => {
    return fileType.startsWith("application/zip") ||
        fileType.startsWith("application/x-zip-compressed") ||
        fileName.toLowerCase().endsWith(".zip");
}

export function truncateFileName(fileName: string, startLength: number = 6, endLength: number = 9) {
    if (fileName.length <= startLength + endLength) {
        return fileName; // no need to truncate
    }

    const start = fileName.substring(0, startLength);
    const end = fileName.substring(fileName.length - endLength);
    return `${start}...${end}`;
}