import {useTranslation} from "react-i18next";
import {useCallback} from "react";
import {type FileRejection, useDropzone} from "react-dropzone";
import {toast} from "react-toastify";
import "../styles/components/Dropzone.css";
import type {FileItem} from "../commons/schemas/file-schemas.ts";
import {isArchive, isImageByFileType} from "../commons/utils/file-utils.ts";
import PopUp from "./PopUp.tsx";

interface DropzoneProps {
    onImagesDropped?: (images: FileItem[]) => void;
    onArchivesDropped?: (archives: FileItem[]) => void;
}

function Dropzone({onImagesDropped, onArchivesDropped}: DropzoneProps) {
    const {t} = useTranslation();

    const accept: Record<string, string[]> = {};

    if (onImagesDropped) accept["image/*"] = [];
    if (onArchivesDropped) {
        accept["application/zip"] = [];
        accept["application/x-zip-compressed"] = [];
    }

    const getInvalidFileTypePopUpDescription = useCallback((fileName: string): string => {
        if (onImagesDropped && onArchivesDropped) return t("dropzone.pop-ups.invalid-file-pop-up.images-and-archives-description", {name: fileName})
        else if (onImagesDropped) return t("dropzone.pop-ups.invalid-file-pop-up.images-only-description", {name: fileName})
        else if (onArchivesDropped) return t("dropzone.pop-ups.invalid-file-pop-up.archives-only-description", {name: fileName})
        else return t("dropzone.pop-ups.invalid-file-pop-up.default", {name: fileName})
    }, [onArchivesDropped, onImagesDropped, t])

    const getTextForDragActive = useCallback((): string => {
        if (onImagesDropped && onArchivesDropped) return t("dropzone.images-and-archives.drag-and-drop-section-text-for-active-drag")
        else if (onImagesDropped) return t("dropzone.images-only.drag-and-drop-section-text-for-active-drag")
        else if (onArchivesDropped) return t("dropzone.archives-only.drag-and-drop-section-text-for-active-drag")
        else return t("dropzone.default.drag-and-drop-section-text-for-active-drag")
    }, [onArchivesDropped, onImagesDropped, t])

    const getTextForDragNotActive = useCallback((): string => {
        if (onImagesDropped && onArchivesDropped) return t("dropzone.images-and-archives.drag-and-drop-section-text-for-not-active-drag")
        else if (onImagesDropped) return t("dropzone.images-only.drag-and-drop-section-text-for-not-active-drag")
        else if (onArchivesDropped) return t("dropzone.archives-only.drag-and-drop-section-text-for-not-active-drag")
        else return t("dropzone.default.drag-and-drop-section-text-for-not-active-drag")
    }, [onArchivesDropped, onImagesDropped, t])

    const onFileDrop = useCallback((files: File[]) => {
        const imageFiles: FileItem[] = [];
        const archiveFiles: FileItem[] = [];

        files.forEach(file => {
            if (isImageByFileType(file)) {
                imageFiles.push({
                    id: `${file.name}-${Date.now()}-${crypto.randomUUID()}.zip`,
                    file
                });
            } else if (isArchive(file)) {
                archiveFiles.push({
                    id: `${file.name}-${Date.now()}-${crypto.randomUUID()}.zip`,
                    file
                });
            }
        });

        if (onImagesDropped && imageFiles.length > 0) onImagesDropped(imageFiles);
        if (onArchivesDropped && archiveFiles.length > 0) onArchivesDropped(archiveFiles);
    }, [onArchivesDropped, onImagesDropped]);

    const onFileDropRejected = useCallback((fileRejections: FileRejection[]) => {
        fileRejections.forEach((fileRejection) => {
            const file = fileRejection.file;
            toast.error(
                <PopUp
                    title={t("dropzone.pop-ups.invalid-file-pop-up.title")}
                    description={getInvalidFileTypePopUpDescription(file.name)}
                />
            );
        })
    }, [getInvalidFileTypePopUpDescription, t])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onFileDrop,
        onDropRejected: onFileDropRejected,
        accept: accept,
        multiple: true
    });

    return (
        <div {...getRootProps()} className="dropzone-container">
            <input {...getInputProps()} className="dropzone-input" />
            {isDragActive ? getTextForDragActive() : getTextForDragNotActive()}
        </div>
    )
}

export default Dropzone;