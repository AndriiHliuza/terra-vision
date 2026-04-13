import "../styles/pages/DetectorPage.css";
import Header from "../components/Header.tsx";
import {useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {toast} from "react-toastify";
import PopUp from "../components/PopUp.tsx";
import {axiosWebClient} from "../configs/axios-web-client.ts";
import i18n from "../configs/i18n.ts";
import JSZip from "jszip";
import {
    blobToFile,
    blobToZip,
    generateArchive,
    isImageByFileName
} from "../commons/utils/file-utils.ts";
import type {ModelDetails} from "../commons/schemas/detector-schemas.ts";
import LoadingOverlay from "../components/LoadingOverlay.tsx";
import Dropzone from "../components/Dropzone.tsx";
import ModelSelector from "../components/detector/ModelSelector.tsx";
import UploadedFilesSection from "../components/detector/UploadedFilesSection.tsx";
import ProcessedFilesSection from "../components/detector/ProcessedFilesSection.tsx";
import type {FileItem} from "../commons/schemas/file-schemas.ts";
import {useAppContext} from "../configs/context/contexts.ts";

function DetectorPage() {

    const {t} = useTranslation();
    const { user } = useAppContext();

    const [isProcessing, setProcessing] = useState<boolean>(false);

    const [models, setModels] = useState<ModelDetails[]>([]);
    const [selectedModel, setSelectedModel] = useState<ModelDetails | null>();

    const [uploadedImages, setUploadedImages] = useState<FileItem[]>([]);
    const [uploadedArchives, setUploadedArchives] = useState<FileItem[]>([]);

    const [processedImages, setProcessedImages] = useState<FileItem[]>([]);
    const [processedArchives, setProcessedArchives] = useState<FileItem[]>([]);

    const outputSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        axiosWebClient
            .get<ModelDetails[]>("/api/ai/models", {params: {lang: i18n.language}})
            .then(response => {
                setModels(response.data)
                const selectedModelId = localStorage.getItem("detection-model") ?? "";
                const selectedModel = response.data.find(model => model.id === selectedModelId)
                setSelectedModel(selectedModel)
                if (!selectedModel) localStorage.removeItem("detection-model");
            }).catch(err => console.log(err))
    }, [t]);

    useEffect(() => {
        if (outputSectionRef.current) {
            outputSectionRef.current.scrollIntoView({behavior: "smooth"});
        }
    }, [processedImages, processedArchives]);

    // --- API calls ---

    const send = async (): Promise<void> => {
        if (!selectedModel) {
            toast.error(
                <PopUp
                    title={t("detector-page.pop-ups.model-not-selected-pop-up.title")}
                    description={t("detector-page.pop-ups.model-not-selected-pop-up.description")}
                />
            );
            return;
        }

        setProcessing(true);
        try {
            const {allArchives, imagesArchive} = await getArchives();
            const resultBlob = await sendArchives(selectedModel.id, allArchives);
            await processResultZip(resultBlob, imagesArchive?.id);
        } catch (error) {
            console.error("Failed to process archives or images: " + error);
            toast.error(
                <PopUp
                    title={t("detector-page.pop-ups.data-processing-failed-popup.title")}
                    description={t("detector-page.pop-ups.data-processing-failed-popup.description")}
                />
            );
        } finally {
            setProcessing(false);
        }
    }

    async function getArchives(): Promise<{
        allArchives: File[],
        imagesArchive: FileItem | null
    }> {
        let imagesArchive: FileItem | null = null;
        if (uploadedImages.length > 0) {
            const zipBlob: Blob = await generateArchive(uploadedImages);
            const zipArchiveName = `images-${Date.now()}-${crypto.randomUUID().toString()}-.zip`;
            const zipArchive: File = blobToZip(zipBlob, zipArchiveName);
            imagesArchive = {id: zipArchive.name, file: zipArchive}
        }

        return {
            allArchives: [
                ...uploadedArchives,
                ...(imagesArchive ? [imagesArchive] : [])]
                .map(archive => archive.file),
            imagesArchive: imagesArchive
        };
    }

    async function sendArchives(modelId: string, archives: File[]) {
        const formData = new FormData();
        if (user) {
            formData.append("user_id", user.id); // append if user is logged in
        }
        formData.append("model_id", modelId);
        formData.append("confidence", "0.25"); // append confidence here
        archives.forEach(archive => formData.append("archives", archive));
        const response = await axiosWebClient.post(
            "/api/ai/detect",
            formData,
            {
                headers: {"Content-Type": "multipart/form-data"},
                responseType: "blob"
            }
        )
        return response.data;
    }

    async function processResultZip(blob: Blob, imagesArchiveName: string | undefined) {
        const extractedArchives: FileItem[] = [];
        const extractedImages: FileItem[] = [];

        const outerZip = await JSZip.loadAsync(blob);

        for (const [archiveName, zipEntry] of Object.entries(outerZip.files)) {
            if (zipEntry.dir) continue;

            const innerArchiveBlob = await zipEntry.async("blob");
            const innerArchiveFile: File = blobToFile(innerArchiveBlob, archiveName);

            extractedArchives.push({
                id: `${archiveName}-${Date.now()}-${crypto.randomUUID()}`,
                file: innerArchiveFile,
            });

            // extract images from the archive that matches uploaded images archive
            if (imagesArchiveName) {
                if (archiveName === imagesArchiveName) {
                    const innerZip = await JSZip.loadAsync(innerArchiveBlob);
                    for (const [fileName, innerZipEntry] of Object.entries(innerZip.files)) {
                        if (innerZipEntry.dir) continue;
                        if (isImageByFileName(fileName)) {
                            const imageBlob = await innerZipEntry.async("blob");
                            const imageFile = blobToFile(imageBlob, fileName);
                            extractedImages.push({
                                id: `${fileName}-${Date.now()}-${crypto.randomUUID()}`,
                                file: imageFile,
                            });
                        }
                    }
                }
            }
        }

        setProcessedArchives(prev => [...prev, ...extractedArchives]);
        setProcessedImages(prev => [...prev, ...extractedImages]);
        toast.success(
            <PopUp
                title={t("detector-page.pop-ups.data-successfully-processed-popup.title")}
                description={t("detector-page.pop-ups.data-successfully-processed-popup.description")}
            />
        );
    }

    return (
        <>
            <Header/>
            <div className="detector-page">
                <section className="input-section">
                    <h1>{t("detector-page.title")}</h1>

                    <ModelSelector
                        models={models}
                        selectedModel={selectedModel}
                        onSelect={model => {
                            setSelectedModel(model);
                            localStorage.setItem("detection-model", model.id);
                        }}
                    />

                    <Dropzone
                        onImagesDropped={(images) => setUploadedImages(prev => [...prev, ...images])}
                        onArchivesDropped={(archives) => setUploadedArchives(prev => [...prev, ...archives])}
                    />

                    <UploadedFilesSection
                        uploadedImages={uploadedImages}
                        uploadedArchives={uploadedArchives}
                        onRemoveImage={id => setUploadedImages(prev => prev.filter(image => image.id !== id))}
                        onRemoveArchive={id => setUploadedArchives(prev => prev.filter(archive => archive.id !== id))}
                        onClear={() => {
                            setUploadedImages([]);
                            setUploadedArchives([]);
                        }}
                        onProcess={send}
                    />

                    {
                        isProcessing
                            ? (
                                <div className="processing-message">
                                    <div
                                        className="processing-message-text">{t("detector-page.processing-message-text.text-1")}<br/>{t("detector-page.processing-message-text.text-2")}
                                    </div>
                                    <LoadingOverlay visible={isProcessing}/>
                                </div>
                            )
                            : null
                    }

                </section>
                <ProcessedFilesSection
                    processedImages={processedImages}
                    processedArchives={processedArchives}
                    onRemoveImage={(id) => setProcessedImages(prev => prev.filter(image => image.id !== id))}
                    onRemoveArchive={(id) => setProcessedArchives(prev => prev.filter(archive => archive.id !== id))}
                    onClear={() => {
                        setProcessedImages([]);
                        setProcessedArchives([]);
                    }}
                    sectionRef={outputSectionRef}
                />

            </div>
        </>

    )
}

export default DetectorPage;