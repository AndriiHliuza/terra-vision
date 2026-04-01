import {useTranslation} from "react-i18next";
import {useScreenWidth} from "../../commons/hooks/hooks.ts";
import {getShortenedString} from "../../commons/utils/string-utils.ts";
import ARCHIVE_IMG from "../../assets/archive-icon.png";
import type {FileItem} from "../../commons/schemas/file-schemas.ts";
import type {StringShorteningRule} from "../../commons/schemas/string-schemas.ts";

const SHORTENING_FILE_NAME_RULES: StringShorteningRule[] = [
    {maxScreenWidth: 300, startStringLength: 3, endStringLength: 4},
    {maxScreenWidth: 500, startStringLength: 4, endStringLength: 6},
    {maxScreenWidth: 9999, startStringLength: 6, endStringLength: 9}, // desktop fallback
]

interface UploadedFilesSectionProps {
    uploadedImages: FileItem[];
    uploadedArchives: FileItem[];
    onRemoveImage: (id: string) => void;
    onRemoveArchive: (id: string) => void;
    onClear: () => void;
    onProcess: () => void;
}

function UploadedFilesSection({
                                  uploadedImages,
                                  uploadedArchives,
                                  onRemoveImage,
                                  onRemoveArchive,
                                  onClear,
                                  onProcess
}: UploadedFilesSectionProps) {
    const {t} = useTranslation();
    const screenWidth = useScreenWidth();

    if (uploadedImages.length === 0 && uploadedArchives.length === 0) return null;

    return (
        <>
            <section className="images-section">
                {uploadedImages.map(image => {
                    const imagePreview = URL.createObjectURL(image.file);
                    return (
                        <div key={image.id} className="image-preview-container">
                            <button onClick={() => onRemoveImage(image.id)}>×</button>
                            <img src={imagePreview} alt={image.file.name} />
                            <div className="image-name-overlay">
                                {getShortenedString(image.file.name, screenWidth, SHORTENING_FILE_NAME_RULES)}
                            </div>
                        </div>
                    );
                })}
            </section>

            <section className="archives-section">
                {uploadedArchives.map(archive => {
                    return (
                        <div key={archive.id} className="archive-preview-container">
                            <button onClick={() => onRemoveArchive(archive.id)}>×</button>
                            <h4>{t("detector-page.archive-item-title").toUpperCase()}</h4>
                            <div>{getShortenedString(archive.file.name, screenWidth, SHORTENING_FILE_NAME_RULES)}</div>
                            <img src={ARCHIVE_IMG} alt="Archive"/>
                        </div>
                    );
                })}
            </section>

            <div className="controls-wrapper">
                <div id="clear-all-images-btn" onClick={onClear}>
                    {t("detector-page.clear-all-images-btn-text")}
                </div>
                <div id="process-images-btn" onClick={onProcess}>
                    {t("detector-page.process-images-btn-text")}
                </div>
            </div>
        </>
    )
}

export default UploadedFilesSection;