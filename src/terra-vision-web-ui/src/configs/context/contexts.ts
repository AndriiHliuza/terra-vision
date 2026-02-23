import {createContext, type Dispatch, type SetStateAction} from "react";
import type {FileItem, CVDataProcessingSummaryStats, User} from "../../commons/models.ts";

export type ApplicationContextData = {
    USER: User | null;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
    CV_DETECTION: {
        UPLOADED_DATA: {
            images: FileItem[];
            archives: FileItem[];
            setImages: Dispatch<SetStateAction<FileItem[]>>;
            setArchives: Dispatch<SetStateAction<FileItem[]>>;
            clear: () => void;
        };
        PROCESSED_DATA: {
            images: FileItem[];
            archives: FileItem[];
            stats: CVDataProcessingSummaryStats | null;
            setImages: Dispatch<SetStateAction<FileItem[]>>;
            setArchives: Dispatch<SetStateAction<FileItem[]>>;
            setStats: Dispatch<SetStateAction<CVDataProcessingSummaryStats | null>>;
            clear: () => void;
        }
    }
};

export const ApplicationContext = createContext<ApplicationContextData | undefined>(undefined);
