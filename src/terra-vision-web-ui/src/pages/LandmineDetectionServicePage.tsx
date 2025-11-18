import '../styles/pages/LandmineDetectionServicePage.css'
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import {useCallback, useState} from "react";
import {useDropzone} from "react-dropzone";
import {useTranslation} from "react-i18next";

function LandmineDetectionServicePage() {

    const {t} = useTranslation();

    const [images, setImages] = useState<File[]>([]);

    const NUMBER_OF_FILES = 10;

    const removeImage = (name: string) => {
        setImages(prev => prev.filter(image => image.name !== name));
    };

    const onImageDrop = useCallback((acceptedFiles: File[]) => {
        const selectedImages = acceptedFiles
            .filter(file => file.type.startsWith("image/"))
            .slice(0, NUMBER_OF_FILES);
        setImages(prev => {
            const newUniqueImage = selectedImages.filter(newImage =>
                !prev.some(existing => existing.name === newImage.name)
            );
            return [...prev, ...newUniqueImage].slice(0, NUMBER_OF_FILES)
        });
    }, [])

    const {
        getRootProps,
        getInputProps,
        isDragActive
    } = useDropzone({
        onDrop: onImageDrop,
        accept: { "image/*": [] },
        multiple: true
    });


    return (
        <>
            <Header />
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

                    <section className="selected-images-section">
                        {images.map(image => {
                            const imagePreview = URL.createObjectURL(image);
                            return (
                                <div
                                    key={image.name}
                                    className="selected-image-preview-container"
                                >
                                    <button onClick={() => removeImage(image.name)}> × </button>
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
                            ? <div
                                id="clear-all-selected-images-btn"
                                onClick={() => setImages([])}
                            >
                                {t("landmine-detection-page.clear-all-selected-images-btn-text")}
                            </div>
                            : null
                    }

                </section>



            </div>
            <Footer />
        </>

    )
}

export default LandmineDetectionServicePage;