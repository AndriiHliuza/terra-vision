import {createContext, type Dispatch, type SetStateAction} from "react";
import {buildUrl} from "../commons/utils.ts";
import {URL_TYPE} from "../commons/models.ts";

export const ROUTES = {
    home: "/",
    map: "/map",
    landmineDetectionService: "/landmine-detector",
    admin: {
        route: "/admin",
        subroutes: {
            dashboard: "dashboard",
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
    ROUTES.map,
    buildUrl([ROUTES.admin.route, ROUTES.admin.subroutes.dashboard], URL_TYPE.ABSOLUTE),
    buildUrl([ROUTES.admin.route, ROUTES.admin.subroutes.map], URL_TYPE.ABSOLUTE),
]
