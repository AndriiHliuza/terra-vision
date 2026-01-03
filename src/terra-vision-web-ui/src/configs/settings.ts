import {createContext, type Dispatch, type SetStateAction} from "react";
import {buildUrl} from "../commons/utils.ts";
import {URL_TYPE} from "../commons/models.ts";
import layer_OSM_Streets from "../assets/map-layers/OSM_Streets.png"
import layer_OSM_Humanitarian from "../assets/map-layers/OSM_Humanitarian.png"
import layer_OpenTopoMap from "../assets/map-layers/OpenTopoMap.png"
import layer_ESRI_Satellite from "../assets/map-layers/ESRI_Satellite.png"
import layer_ESRI_Topographic from "../assets/map-layers/ESRI_Topographic.png"
import layer_Carto_Light from "../assets/map-layers/Carto_Light.png"

export const ROUTES = {
    home: "/",
    map: "/map",
    landmineDetectionService: "/landmine-detector",
    admin: {
        route: "/admin",
        subroutes: {
            dashboard: "dashboard",
            mapEditor: "map/editor"
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
    buildUrl([ROUTES.admin.route, ROUTES.admin.subroutes.mapEditor], URL_TYPE.ABSOLUTE),
]

export const MAP_LAYERS = [
    {
        name: "OSM Streets",
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
        img: layer_OSM_Streets
    },
    {
        name: "OSM Humanitarian",
        url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
        attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, Tiles style by HOT OSM",
        img: layer_OSM_Humanitarian
    },
    {
        name: "OpenTopoMap",
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution: "Map data: &copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, SRTM | Map style: &copy; <a href=\"https://opentopomap.org\">OpenTopoMap</a>",
        img: layer_OpenTopoMap
    },
    {
        name: "ESRI Satellite",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics, USDA, USGS",
        img: layer_ESRI_Satellite
    },
    {
        name: "ESRI Topographic",
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri — Esri, DeLorme, NAVTEQ, TomTom, USGS, FAO, NPS",
        img: layer_ESRI_Topographic
    },
    {
        name: "Carto Light",
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors, &copy; <a href=\"https://carto.com/attributions\">CARTO</a>",
        img: layer_Carto_Light
    }
]
