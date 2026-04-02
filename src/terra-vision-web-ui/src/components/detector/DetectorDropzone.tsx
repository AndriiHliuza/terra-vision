import {useTranslation} from "react-i18next";
import {useCallback} from "react";
import {type FileRejection, useDropzone} from "react-dropzone";
import {toast} from "react-toastify";
import "../../styles/components/detector/DetectorDropzone.css";
import type {FileItem} from "../../commons/schemas/file-schemas.ts";
import {isArchive, isImageByFileType} from "../../commons/utils/file-utils.ts";
import PopUp from "../PopUp.tsx";

interface DetectorDropzoneProps {
    onImagesDropped: (images: FileItem[]) => void;
    onArchivesDropped: (archives: FileItem[]) => void;
}

function DetectorDropzone({onImagesDropped, onArchivesDropped}: DetectorDropzoneProps) {
    const {t} = useTranslation();

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

        if (imageFiles.length > 0) onImagesDropped(imageFiles);
        if (archiveFiles.length > 0) onArchivesDropped(archiveFiles);
    }, [onArchivesDropped, onImagesDropped]);

    const onFileDropRejected = useCallback((fileRejections: FileRejection[]) => {
        fileRejections.forEach((fileRejection) => {
            const file = fileRejection.file;
            toast.error(
                <PopUp
                    title={t("detector-page.pop-ups.invalid-file-pop-up.title")}
                    description={t("detector-page.pop-ups.invalid-file-pop-up.description", {name: file.name})}
                />
            );
        })
    }, [t])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onFileDrop,
        onDropRejected: onFileDropRejected,
        accept: {
            "image/*": [],
            "application/zip": [],
            "application/x-zip-compressed": []
        },
        multiple: true
    });

    return (
        <div {...getRootProps()} className="dropzone-container">
            <input {...getInputProps()} className="dropzone-input" />
            {isDragActive
                ? t("detector-page.drag-and-drop-section-text-for-active-drag")
                : t("detector-page.drag-and-drop-section-text-for-not-active-drag")
            }
        </div>
    )
}

export default DetectorDropzone;