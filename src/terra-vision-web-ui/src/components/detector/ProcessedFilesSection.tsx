import type {RefObject} from "react";
import {useTranslation} from "react-i18next";
import {useScreenWidth} from "../../commons/hooks/hooks.ts";
import {getShortenedString} from "../../commons/utils/string-utils.ts";
import downloadIcon from "../../assets/download-btn-img.png";
import archiveImg from "../../assets/archive-icon.png";
import type {FileItem} from "../../commons/schemas/file-schemas.ts";
import type {StringShorteningRule} from "../../commons/schemas/string-schemas.ts";

const SHORTENING_FILE_NAME_RULES: StringShorteningRule[] = [
    {maxScreenWidth: 300, startStringLength: 3, endStringLength: 4},
    {maxScreenWidth: 500, startStringLength: 4, endStringLength: 6},
    {maxScreenWidth: 9999, startStringLength: 6, endStringLength: 9}, // desktop fallback
]

interface ProcessedFilesSectionProps {
    processedImages: FileItem[];
    processedArchives: FileItem[];
    onRemoveImage: (id: string) => void;
    onRemoveArchive: (id: string) => void;
    onClear: () => void;
    sectionRef: RefObject<HTMLDivElement | null>;
}

function ProcessedFilesSection({
                                   processedImages,
                                   processedArchives,
                                   onRemoveImage,
                                   onRemoveArchive,
                                   onClear,
                                   sectionRef
}: ProcessedFilesSectionProps) {
    const {t} = useTranslation();
    const screenWidth = useScreenWidth();

    if (processedImages.length === 0 && processedArchives.length === 0) return null;
    return (
        <section ref={sectionRef} className="output-section">
            <h1>{t("detector-page.processed-files-section.title")}</h1>

            <section className="images-section">
                {processedImages.map(image => {
                    const imagePreview = URL.createObjectURL(image.file);
                    return (
                        <div key={image.id} className="image-preview-container">
                            <button onClick={() => onRemoveImage(image.id)}> ×</button>
                            <img src={imagePreview} alt={image.file.name}/>
                            <div className="image-name-overlay">
                                {getShortenedString(image.file.name, screenWidth, SHORTENING_FILE_NAME_RULES)}
                            </div>
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
                        <div key={archive.id} className="archive-preview-container">
                            <button onClick={() => onRemoveArchive(archive.id)}>×</button>
                            <h4>{t("detector-page.archive-item-title").toUpperCase()}</h4>
                            <div>{getShortenedString(archive.file.name, screenWidth, SHORTENING_FILE_NAME_RULES)}</div>
                            <a
                                href={archiveUrl}
                                download={archive.file.name} // sets downloaded filename
                                className="archive-download-btn"
                            >{t("detector-page.download-archive-btn")}</a>
                            <img src={archiveImg} alt="Archive"/>
                        </div>
                    );
                })}
            </section>

            <div className="controls-wrapper">
                <div id="clear-all-images-btn" onClick={onClear}>
                    {t("detector-page.clear-all-images-btn-text")}
                </div>
            </div>

        </section>
    )
}

export default ProcessedFilesSection;