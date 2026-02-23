import "../styles/pages/ComputerVisionPage.css";
import Header from "../components/Header.tsx";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import {type FileRejection, useDropzone} from "react-dropzone";
import {useTranslation} from "react-i18next";
import {toast} from "react-toastify";
import PopUp from "../components/PopUp.tsx";
import downloadIcon from "../assets/download-icon.png";
import {
    type CVModelDescription,
    type CVModelDescriptionResponse,
    type FileItem,
    type CVProcessingSummaryStats
} from "../commons/models.ts";
import {
    blobToFile,
    blobToZip,
    createArchiveFromFileItems,
    getTruncateFileNameLengthsByWidth,
    isArchive, isImage,
    truncateFileName,
    useScreenWidth
} from "../commons/utils.ts";
import {API_URLS, ROUTES, TRUNCATE_FILE_NAME_RULES} from "../configs/settings.ts";
import ARCHIVE_IMG from "../assets/archive-icon.png";
import {Dropdown} from "../components/Dropdown.tsx";
import {axiosWebClient} from "../configs/axiosWebClient.ts";
import i18n from "../configs/i18n.ts";
import axios from "axios";
import JSZip from "jszip";
import PartialLoadingOverlay from "../components/PartialLoadingOverlay.tsx";
import {useNavigate} from "react-router-dom";
import {ApplicationContext} from "../configs/context/contexts.ts";

function CVDetectionPage() {

    const {t} = useTranslation();
    const navigate = useNavigate();
    const applicationContext = useContext(ApplicationContext);
    if (!applicationContext) throw new Error("ApplicationContext not found");
    const { UPLOADED_DATA, PROCESSED_DATA } = applicationContext.CV_DETECTION
    const screenWidth = useScreenWidth();

    /* getTruncateFileNameLengthsByWidth runs on every render/rerender (when screenWidth changes) */
    const {
        startFileNameLength,
        endFileNameLength
    } = getTruncateFileNameLengthsByWidth(screenWidth, TRUNCATE_FILE_NAME_RULES)

    const [isProcessing, setProcessing] = useState<boolean>(false);

    const [models, setModels] = useState<CVModelDescription[]>([]);
    const [selectedModel, setSelectedModel] = useState<CVModelDescription | null>();
    
    const outputSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        /* Getting all models */
        axiosWebClient.get<CVModelDescriptionResponse>(API_URLS.AI_CV_MODELS_URL, {
            params: {lang: i18n.language}
        }).then(response => {
            setModels(response.data.cv_models)

            /* Checking if stored in localstorage model actually exists */
            const selectedModelId = localStorage.getItem("selectedLandmineDetectionModel") ?? "";
            const selectedModel = response.data.cv_models.find(model => model.id === selectedModelId)
            setSelectedModel(selectedModel)
            if (!selectedModel) {
                localStorage.removeItem("selectedLandmineDetectionModel");
            }

        }).catch(err => {
            console.log(err);
        })
    }, [t]);

    useEffect(() => {
        if (outputSectionRef.current) {
            outputSectionRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [PROCESSED_DATA.images, PROCESSED_DATA.archives]);

    const removeUploadedImage = (id: string) => {
        UPLOADED_DATA.setImages(prev => prev.filter(image => image.id !== id));
    };

    const removeUploadedArchive = (id: string) => {
        UPLOADED_DATA.setArchives(prev => prev.filter(archive => archive.id !== id));
    };

    const clearUploadedFiles = () => {
        UPLOADED_DATA.clear();
    }

    const removeProcessedImage = (id: string) => {
        PROCESSED_DATA.setImages(prev => prev.filter(image => image.id !== id));
    };

    const removeProcessedArchive = (id: string) => {
        PROCESSED_DATA.setArchives(prev => prev.filter(archive => archive.id !== id));
    };


    const clearProcessedFiles = () => {
        PROCESSED_DATA.clear();
    }

    async function sendArchives(modelId: string, archives: File[]) {
        const formData = new FormData();

        const randomUserId = crypto.randomUUID()
        console.log("random user id: " + randomUserId);
        formData.append("user_id", randomUserId);
        formData.append("model_id", modelId);
        archives.forEach(archive => formData.append("archives", archive));
        return await axios.post(
            API_URLS.AI_CV_PROCESSING_URL,
            formData,
            {
                responseType: "blob",
                headers: {"Content-Type": "multipart/form-data"}
            }
        )
    }

    async function extractProcessingStats(outerZip: JSZip): Promise<CVProcessingSummaryStats | null> {
        try {
            const statsFile = outerZip.file("processing_stats.json");

            if (!statsFile) {
                console.warn("processing_stats.json not found in archive");
                return null;
            }

            const statsContent = await statsFile.async("string");
            const stats: CVProcessingSummaryStats = JSON.parse(statsContent);

            console.log("Processing Statistics:");
            console.log(`Total Images: ${stats.overall_stats.total_images}`);
            console.log(`Successfully Processed: ${stats.overall_stats.successfully_processed_images}`);
            console.log(`Failed: ${stats.overall_stats.failed_images}`);
            console.log(`Total Detections: ${stats.overall_stats.total_detections}`);
            console.log(`Processing Time: ${stats.overall_stats.processing_time_seconds}s`);

            // Log class breakdown
            Object.values(stats.overall_stats.per_class_stats).forEach(classStat => {
                console.log(`Class: '${classStat.class_name}': ${classStat.total_detections} detections in ${classStat.images_containing_class} images`);
            });

            return stats;
        } catch (error) {
            console.error("Error extracting processing stats:", error);
            return null;
        }
    }

    async function processResult(outerZip: JSZip, imagesArchiveName: string | undefined, stats: CVProcessingSummaryStats | null) {
        const extractedArchives: FileItem[] = [];
        const extractedImages: FileItem[] = [];

        for (const [archiveName, zipEntry] of Object.entries(outerZip.files)) {
            if (zipEntry.dir) continue;

            // Skip the stats file - we already extracted it
            if (archiveName === "processing_stats.json") continue;

            const innerArchiveBlob = await zipEntry.async('blob');
            const innerArchiveFile: File = blobToFile(innerArchiveBlob, archiveName);

            extractedArchives.push({
                id: `${archiveName}-${Date.now()}-${crypto.randomUUID().toString()}`,
                file: innerArchiveFile,
            });

            if (archiveName === imagesArchiveName) {
                const innerZip = await JSZip.loadAsync(innerArchiveBlob);
                for (const [fileName, innerZipEntry] of Object.entries(innerZip.files)) {
                    if (innerZipEntry.dir) continue;

                    if (isImage(fileName)) {
                        const imageBlob = await innerZipEntry.async('blob');
                        const imageFile = blobToFile(imageBlob, fileName);

                        extractedImages.push({
                            id: `${fileName}-${Date.now()}-${crypto.randomUUID().toString()}`,
                            file: imageFile,
                        });
                    }
                }
            }
        }
        PROCESSED_DATA.setArchives(prev => [...prev, ...extractedArchives]);
        PROCESSED_DATA.setImages(prev => [...prev, ...extractedImages]);

        if (stats) {
            console.log(stats)
            PROCESSED_DATA.setStats(stats);
            toast.success(
                <PopUp
                    title={t("landmine-detection-page.pop-ups.cv-processing-successfully-completed-pop-up.title")}
                    description={t("landmine-detection-page.pop-ups.cv-processing-successfully-completed-pop-up.description", {
                        successfully_processed_images: stats.overall_stats.successfully_processed_images.toString(),
                        total_images: stats.overall_stats.total_images.toString(),
                        total_detections: stats.overall_stats.total_detections.toString(),
                        processing_time_seconds: stats.overall_stats.processing_time_seconds.toFixed(2)
                    })}
                />
            );
        }
    }

    async function sendArchivesAndProcessResult(modelId: string, archives: File[], imagesArchiveName: string | undefined) {
        const response = await sendArchives(modelId, archives);
        const outerArchiveBlob: Blob = response.data;
        const outerZip = await JSZip.loadAsync(outerArchiveBlob);
        const stats = await extractProcessingStats(outerZip); // Extract stats first
        await processResult(outerZip, imagesArchiveName, stats);
    }

    async function getArchives(): Promise<{
        "allArchives": File[],
        "imagesArchive": FileItem | null
    }> {
        let imagesArchive: FileItem | null = null;
        if (UPLOADED_DATA.images.length > 0) {
            const zipBlob: Blob = await createArchiveFromFileItems(UPLOADED_DATA.images);
            const zipArchiveName = `images-${Date.now()}-${crypto.randomUUID().toString()}-.zip`;
            const zipArchive: File = blobToZip(zipBlob, zipArchiveName);
            imagesArchive = {
                id: zipArchive.name,
                file: zipArchive
            }
        }

        return {
            "allArchives": [
                ...UPLOADED_DATA.archives,
                ...(imagesArchive ? [imagesArchive] : [])]
                .map(archive => archive.file),
            "imagesArchive": imagesArchive
        };
    }

    const send = async (): Promise<void> => {
        if (selectedModel) {
            setProcessing(true);
            try {
                const {
                    allArchives: archivesToSend,
                    imagesArchive: imagesArchive
                } = await getArchives();
                await sendArchivesAndProcessResult(selectedModel.id, archivesToSend, imagesArchive?.id)
            } catch (error) {
                console.error("Error sending archives and images: " + error);
            }
            setProcessing(false);
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
                    id: `${file.name}-${Date.now()}-${crypto.randomUUID().toString()}-.zip`,
                    file: file
                })
            } else if (isArchive(file.type, file.name)) {
                archiveFiles.push({
                    id: `${file.name}-${Date.now()}-${crypto.randomUUID().toString()}-.zip`,
                    file: file
                })
            }
        })

        UPLOADED_DATA.setImages(prev => [...prev, ...imageFiles])
        UPLOADED_DATA.setArchives(prev => [...prev, ...archiveFiles])
    }, [UPLOADED_DATA])

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
            <div id="cv-detection-service-page">
                <section className="input-section">
                    <h1>{t("landmine-detection-page.title")}</h1>
                    <div className="models-section">
                        <div className="models-dropdown-container">
                            <Dropdown
                                label={selectedModel?.name ? selectedModel.name : t("landmine-detection-page.models-dropdown-title")}
                                items={models.map(model => ({
                                    id: model.id,
                                    name: model.name,
                                }))}
                                onSelect={model => {
                                    setSelectedModel(models.find(m => m.id === model.id));
                                    localStorage.setItem("selectedLandmineDetectionModel", model.id);
                                }}
                            />
                        </div>
                        <div className="model-description">{models
                            .find(model => model.id === selectedModel?.id)
                            ?.description ?? t("landmine-detection-page.model-description-default-text")
                        }</div>
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
                        {UPLOADED_DATA.images.map(image => {
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
                        {UPLOADED_DATA.archives.map(archive => {
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
                        UPLOADED_DATA.images.length > 0 ||
                        UPLOADED_DATA.archives.length > 0
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
                                        onClick={send}
                                    >
                                        {t("landmine-detection-page.process-images-btn-text")}
                                    </div>
                                </div>
                            )
                            : null
                    }

                    {
                        isProcessing
                            ? (
                                <div className="processing-message">
                                    <div
                                        className="processing-message-text">{t("landmine-detection-page.processing-message-text.text-1")}<br/>{t("landmine-detection-page.processing-message-text.text-2")}
                                    </div>
                                    <PartialLoadingOverlay visible={isProcessing}/>
                                </div>
                            )
                            : null
                    }

                </section>
                {
                    PROCESSED_DATA.images.length > 0 || PROCESSED_DATA.archives.length > 0
                        ? (
                            <section
                                ref={outputSectionRef}
                                className="output-section"
                            >
                                <h1>{t("landmine-detection-page.processed-files-section.title")}</h1>
                                <section className="images-section">
                                    {PROCESSED_DATA.images.map(image => {
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
                                    {PROCESSED_DATA.archives.map(archive => {
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
                                    PROCESSED_DATA.images.length > 0 ||
                                    PROCESSED_DATA.archives.length > 0
                                        ? (
                                            <div className="controls-wrapper">
                                                <div
                                                    id="clear-all-images-btn"
                                                    onClick={clearProcessedFiles}
                                                >
                                                    {t("landmine-detection-page.clear-all-images-btn-text")}
                                                </div>
                                                {PROCESSED_DATA.stats
                                                    ? <div
                                                        id="view-stats-btn"
                                                        onClick={() => navigate(ROUTES.COMPUTER_VISION_DETECTION_ROUTES.STATS_ROUTE.ROOT)}
                                                    >
                                                        {t("landmine-detection-page.view-stats-btn-text")}
                                                    </div>
                                                    : null
                                                }
                                            </div>
                                        )
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

export default CVDetectionPage;