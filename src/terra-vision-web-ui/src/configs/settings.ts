import {createContext, type Dispatch, type SetStateAction} from "react";

export const ROUTES = {
    home: "/",
    map: "/map",
    landmineDetectionService: "/landmine-detector",
    admin: {
        baseRoute: "/admin",
        subroutes: {
            map: "map"
        }
    },
    notFound: "*",
};

export type ApplicationContextSettings = {
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
};

export const ApplicationContext = createContext<ApplicationContextSettings | undefined>(undefined);

export const ROUTES_WITHOUT_MOUSE_TRAIL = [
    ROUTES.map
]
