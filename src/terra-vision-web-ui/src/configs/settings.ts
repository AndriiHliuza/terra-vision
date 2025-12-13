import {createContext, type Dispatch, type SetStateAction} from "react";

export const ROUTES = {
    home: "/",
    map: "/map",
    landmineDetectionService: "/landmine-detector",
    notFound: "*",
};

export type ApplicationContextSettings = {
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
};

export const ApplicationContext = createContext<ApplicationContextSettings | undefined>(undefined);
