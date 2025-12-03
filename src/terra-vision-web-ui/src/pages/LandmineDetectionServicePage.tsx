import '../styles/pages/LandmineDetectionServicePage.css'
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import {useCallback, useState} from "react";
import {useDropzone} from "react-dropzone";
import {useTranslation} from "react-i18next";
import {toast} from "react-toastify";
import PopUp from "../components/PopUp.tsx";
import downloadIcon from "../assets/download-icon.png";

function LandmineDetectionServicePage() {

    const {t} = useTranslation();

    const [images, setImages] = useState<File[]>([]);
    const [processedImages, setProcessedImages] = useState<File[]>([]);

    const removeImage = (name: string) => {
        setImages(prev => prev.filter(image => image.name !== name));
    };

    const removeProcessedImage = (name: string) => {
        setProcessedImages(prev => prev.filter(image => image.name !== name));
    };

    const onImageDrop = useCallback((files: File[]) => {
        setImages(previousImages => {
            const newImages = files
                .filter((file) => file.type.startsWith("image"));

            const duplicateImages = newImages.filter((newImage) =>
                previousImages.some((existing) => existing.name === newImage.name)
            );

            duplicateImages.forEach(image => toast.error(
                <PopUp title={t("landmine-detection-page.pop-up.title", {name: image.name})}
                       description={t("landmine-detection-page.pop-up.description")}/>
            ));

            const uniqueImages = newImages.filter(
                (newImage) => !previousImages.some((existing) => existing.name === newImage.name)
            );

            return [...previousImages, ...uniqueImages];
        });

        // setProcessedImages(files) is temporary. Will get images from backend after processing them.
        setProcessedImages(files)
    }, [t])

    const {
        getRootProps,
        getInputProps,
        isDragActive
    } = useDropzone({
        onDrop: onImageDrop,
        accept: {"image/*": []},
        multiple: true
    });


    return (
        <>
            <Header/>
            <div id="lm-detection-service-page">
                <section>
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
                        {images.map(image => {
                            const imagePreview = URL.createObjectURL(image);
                            return (
                                <div
                                    key={image.name}
                                    className="image-preview-container"
                                >
                                    <button onClick={() => removeImage(image.name)}> ×</button>
                                    <img
                                        src={imagePreview}
                                        alt={image.name}
                                    />
                                </div>
                            );
                        })}
                    </section>

                    {
                        images.length > 0
                            ? (
                                <div className="controls-wrapper">
                                    <div
                                        id="clear-all-images-btn"
                                        onClick={() => setImages([])}
                                    >
                                        {t("landmine-detection-page.clear-all-images-btn-text")}
                                    </div>
                                    <div id="process-images-btn">{t("landmine-detection-page.process-images-btn-text")}</div>
                                </div>
                            )
                            : null
                    }

                </section>
                {
                    processedImages.length > 0
                        ? (
                            <section className="output-section">
                                <h1>{t("landmine-detection-page.processed-images-section.title")}</h1>
                                <section className="images-section">
                                    {processedImages.map(image => {
                                        const imagePreview = URL.createObjectURL(image);
                                        return (
                                            <div
                                                key={image.name}
                                                className="image-preview-container"
                                            >
                                                <button onClick={() => removeProcessedImage(image.name)}> ×</button>
                                                <img
                                                    src={imagePreview}
                                                    alt={image.name}
                                                />
                                                <a
                                                    href={imagePreview}
                                                    download={image.name} // filename when downloaded
                                                    className="image-download-btn"
                                                >
                                                    <img src={downloadIcon} alt="Download" className="image-download-icon"/>
                                                </a>
                                            </div>
                                        );
                                    })}
                                </section>
                                {
                                    processedImages.length > 0
                                        ? <div
                                            id="clear-all-images-btn"
                                            onClick={() => setProcessedImages([])}
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
            <Footer/>
        </>

    )
}

export default LandmineDetectionServicePage;