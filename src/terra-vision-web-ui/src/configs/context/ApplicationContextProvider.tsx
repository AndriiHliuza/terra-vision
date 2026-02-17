import {type PropsWithChildren, useState} from "react";
import { ApplicationContext } from "./contexts";
import type {FileItem, ProcessingSummary} from "../../commons/models.ts";

const ApplicationContextProvider = ({ children }: PropsWithChildren) => {
    const [loading, setLoading] = useState(false);

    const [uploadedImages, setUploadedImages] = useState<FileItem[]>([]);
    const [uploadedArchives, setUploadedArchives] = useState<FileItem[]>([]);

    const [processedImages, setProcessedImages] = useState<FileItem[]>([]);
    const [processedArchives, setProcessedArchives] = useState<FileItem[]>([]);
    const [stats, setStats] = useState<ProcessingSummary | null>(null);

    return (
        <ApplicationContext.Provider value={{
            loading,
            setLoading,
            CV_DETECTION: {
                UPLOADED_DATA: {
                    images: uploadedImages,
                    archives: uploadedArchives,
                    setImages: setUploadedImages,
                    setArchives: setUploadedArchives,
                    clear: () => {
                        setUploadedImages([]);
                        setUploadedArchives([]);
                    },
                },
                PROCESSED_DATA: {
                    images: processedImages,
                    archives: processedArchives,
                    stats,
                    setImages: setProcessedImages,
                    setArchives: setProcessedArchives,
                    setStats,
                    clear: () => {
                        setProcessedImages([]);
                        setProcessedArchives([]);
                        setStats(null);
                    },
                }
            }
        }}>
            {children}
        </ApplicationContext.Provider>
    );
}

export default ApplicationContextProvider;