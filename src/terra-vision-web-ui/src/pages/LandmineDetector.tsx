import "../styles/pages/LandmineDetector.css";
import Header from "../components/Header.tsx";
import {useCallback, useEffect, useRef, useState} from "react";
import {type FileRejection, useDropzone} from "react-dropzone";
import {useTranslation} from "react-i18next";
import {toast} from "react-toastify";
import PopUp from "../components/PopUp.tsx";
import downloadIcon from "../assets/download-icon.png";
import type {FileItem} from "../commons/models.ts";
import {
    blobToZip,
    createArchiveFromFileItems,
    getTruncateFileNameLengthsByWidth,
    isArchive,
    truncateFileName, useScreenWidth
} from "../commons/utils.ts";
import {TRUNCATE_FILE_NAME_RULES} from "../configs/settings.ts";
import ARCHIVE_IMG from "../assets/archive-icon.png";
import {Dropdown} from "../components/Dropdown.tsx";

function LandmineDetector() {

    const {t} = useTranslation();

    const screenWidth = useScreenWidth();

    const {
        startFileNameLength,
        endFileNameLength
    } = getTruncateFileNameLengthsByWidth(screenWidth, TRUNCATE_FILE_NAME_RULES)

    const [uploadedImages, setUploadedImages] = useState<FileItem[]>([]);
    const [uploadedArchives, setUploadedArchives] = useState<FileItem[]>([]);

    const [processedImages, setProcessedImages] = useState<FileItem[]>([]);
    const [processedArchives, setProcessedArchives] = useState<FileItem[]>([]);

    const [isProcessed, setProcessed] = useState<boolean>(false);

    const [models, setModels] = useState<string[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>(() => {
        return localStorage.getItem("selectedLandmineDetectionModel") ?? "";
    });

    const outputSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // fetch available models from backend
        // GET /api/terra-vision-ai/models?lang=ua
        // Returned DTO: models: [ {enName: FAST, lang: ua, langName: ШВИДКА, description: "Model description in specified language"}, {enName: STANDARD, lang: ua, langName: СТАНДАРТНА, description: "Model description in specified language"} ]
        const modelNamesFromBackend = ["FAST", "STANDARD", "LARGE"]
        setModels(modelNamesFromBackend)
    }, [t]);

    const removeUploadedImage = (id: string) => {
        setUploadedImages(prev => prev.filter(image => image.id !== id));
    };

    const removeUploadedArchive = (id: string) => {
        setUploadedArchives(prev => prev.filter(archive => archive.id !== id));
    };

    const clearUploadedFiles = () => {
        setUploadedImages([]);
        setUploadedArchives([]);
    }

    const removeProcessedImage = (id: string) => {
        setProcessedImages(prev => prev.filter(image => image.id !== id));
    };

    const removeProcessedArchive = (id: string) => {
        setProcessedArchives(prev => prev.filter(archive => archive.id !== id));
    };


    const clearProcessedFiles = () => {
        setProcessedImages([]);
        setProcessedArchives([]);
        setProcessed(false)
    }

    useEffect(() => {
        if (outputSectionRef.current) {
            outputSectionRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [processedImages, processedArchives]);

    const process = async (): Promise<void> => {
        if (selectedModel) {
            if (!isProcessed) {
                if (uploadedImages.length > 0) {
                    const zipBlob: Blob = await createArchiveFromFileItems(uploadedImages);
                    const zipArchive: File = blobToZip(zipBlob, "images.zip");
                    const fileItem: FileItem = {
                        id: zipArchive.name + "-" + Date.now() + "-" + Math.random().toString(),
                        file: zipArchive
                    }

                    setProcessedArchives(prev => [
                        ...prev,
                        fileItem
                    ])
                }

                // setProcessedImages and setProcessedArchives are temporary. Will get images from backend after processing them.
                setProcessedImages(prev => [...prev, ...uploadedImages])
                setProcessedArchives(prev => [...prev, ...uploadedArchives])

                setProcessed(true);
            } else {
                toast.error(
                    <PopUp
                        title={t("landmine-detection-page.pop-ups.files-already-processed-pop-up.title")}
                        description={t("landmine-detection-page.pop-ups.files-already-processed-pop-up.description")}
                    />
                );
            }
        } else {
            toast.error(
                <PopUp
                    title={t("landmine-detection-page.pop-ups.model-not-selected-pop-up.title")}
                    description={t("landmine-detection-page.pop-ups.model-not-selected-pop-up.description")}
                />
            );
        }

    }

    const onFileDrop = useCallback((files: File[]) => {

        const imageFiles: FileItem[] = [];
        const archiveFiles: FileItem[] = [];

        files.forEach(file => {
            if (file.type.startsWith("image")) {
                imageFiles.push({
                    id: file.name + "-" + Date.now() + "-" + Math.random(),
                    file: file
                })
            } else if (isArchive(file.type, file.name)) {
                archiveFiles.push({
                    id: file.name + "-" + Date.now() + "-" + Math.random(),
                    file: file
                })
            }
        })

        if (imageFiles.length > 0 || archiveFiles.length > 0) setProcessed(false);

        setUploadedImages(prev => [...prev, ...imageFiles])
        setUploadedArchives(prev => [...prev, ...archiveFiles])
    }, [])

    const onFileDropRejected = useCallback((fileRejections: FileRejection[]) => {
        fileRejections.forEach((fileRejection) => {
            const file = fileRejection.file;
            if (!file.type.startsWith("image") || !isArchive(file.type, file.name)) {
                toast.error(
                    <PopUp
                        title={t("landmine-detection-page.pop-ups.invalid-file-pop-up.title")}
                        description={t("landmine-detection-page.pop-ups.invalid-file-pop-up.description", {name: file.name})}
                    />
                );
            }
        })
    }, [t])

    const {
        getRootProps,
        getInputProps,
        isDragActive
    } = useDropzone({
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
        <>
            <Header/>
            <div id="lm-detection-service-page">
                <section className="input-section">
                    <h1>{t("landmine-detection-page.title")}</h1>
                    <div className="models-section">
                        <div className="models-dropdown-container">
                            <Dropdown
                                label={selectedModel ? selectedModel : t("landmine-detection-page.models-dropdown-title")}
                                items={models}
                                onSelect={value => {
                                    setSelectedModel(value);
                                    localStorage.setItem("selectedLandmineDetectionModel", value);
                                }}
                            />
                        </div>
                        <div className="model-description">TRY OUR MODELS</div>
                    </div>

                    {/* Dropzone area */}
                    <div
                        {...getRootProps()}
                        className="dropzone-container"
                    >
                        <input
                            {...getInputProps()}
                            className="dropzone-input"
                        />
                        {isDragActive
                            ? t("landmine-detection-page.drag-and-drop-section-text-for-active-drag")
                            : t("landmine-detection-page.drag-and-drop-section-text-for-not-active-drag")
                        }
                    </div>

                    <section className="images-section">
                        {uploadedImages.map(image => {
                            const imagePreview = URL.createObjectURL(image.file);
                            return (
                                <div
                                    key={image.id}
                                    className="image-preview-container"
                                >
                                    <button onClick={() => removeUploadedImage(image.id)}>×</button>
                                    <img
                                        src={imagePreview}
                                        alt={image.file.name}
                                    />
                                    <div
                                        className="image-name-overlay">{truncateFileName(image.file.name, startFileNameLength, endFileNameLength)}</div>
                                </div>
                            );
                        })}
                    </section>

                    <section className="archives-section">
                        {uploadedArchives.map(archive => {
                            return (
                                <div
                                    key={archive.id}
                                    className="archive-preview-container"
                                >
                                    <button onClick={() => removeUploadedArchive(archive.id)}>×</button>
                                    <h4>{t("landmine-detection-page.archive-item-title").toUpperCase()}</h4>
                                    <div>{truncateFileName(archive.file.name, startFileNameLength, endFileNameLength)}</div>
                                    <img src={ARCHIVE_IMG} alt="Archive"/>
                                </div>
                            );
                        })}
                    </section>

                    {
                        uploadedImages.length > 0 ||
                        uploadedArchives.length > 0
                            ? (
                                <div className="controls-wrapper">
                                    <div
                                        id="clear-all-images-btn"
                                        onClick={clearUploadedFiles}
                                    >
                                        {t("landmine-detection-page.clear-all-images-btn-text")}
                                    </div>
                                    <div
                                        id="process-images-btn"
                                        onClick={process}
                                    >
                                        {t("landmine-detection-page.process-images-btn-text")}
                                    </div>
                                </div>
                            )
                            : null
                    }

                </section>
                {
                    processedImages.length > 0 || processedArchives.length > 0
                        ? (
                            <section
                                ref={outputSectionRef}
                                className="output-section"
                            >
                                <h1>{t("landmine-detection-page.processed-files-section.title")}</h1>
                                <section className="images-section">
                                    {processedImages.map(image => {
                                        const imagePreview = URL.createObjectURL(image.file);
                                        return (
                                            <div
                                                key={image.id}
                                                className="image-preview-container"
                                            >
                                                <button onClick={() => removeProcessedImage(image.id)}> ×</button>
                                                <img
                                                    src={imagePreview}
                                                    alt={image.file.name}
                                                />
                                                <div
                                                    className="image-name-overlay">{truncateFileName(image.file.name, startFileNameLength, endFileNameLength)}</div>
                                                <a
                                                    href={imagePreview}
                                                    download={image.file.name} // filename when downloaded
                                                    className="image-download-btn"
                                                >
                                                    <img src={downloadIcon} alt="Download" className="image-download-icon"/>
                                                </a>
                                            </div>
                                        );
                                    })}
                                </section>

                                <section className="archives-section">
                                    {processedArchives.map(archive => {
                                        const archiveUrl = URL.createObjectURL(archive.file);
                                        return (
                                            <div
                                                key={archive.id}
                                                className="archive-preview-container"
                                            >
                                                <button onClick={() => removeProcessedArchive(archive.id)}>×</button>
                                                <h4>{t("landmine-detection-page.archive-item-title").toUpperCase()}</h4>
                                                <div>{truncateFileName(archive.file.name, startFileNameLength, endFileNameLength)}</div>
                                                <a
                                                    href={archiveUrl}
                                                    download={archive.file.name} // sets downloaded filename
                                                    className="archive-download-btn"
                                                >{t("landmine-detection-page.download-archive-btn")}</a>
                                                <img src={ARCHIVE_IMG} alt="Archive"/>
                                            </div>
                                        );
                                    })}
                                </section>

                                {
                                    processedImages.length > 0 ||
                                    processedArchives.length > 0
                                        ? <div
                                            id="clear-all-images-btn"
                                            onClick={clearProcessedFiles}
                                        >
                                            {t("landmine-detection-page.clear-all-images-btn-text")}
                                        </div>
                                        : null
                                }

                            </section>
                        )
                        : null
                }

            </div>
        </>

    )
}

export default LandmineDetector;