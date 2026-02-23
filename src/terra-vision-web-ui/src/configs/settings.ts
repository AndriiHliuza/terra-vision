import {buildUrlForAllLanguages} from "../commons/utils.ts";
import {type TruncateFileNameRule, URL_TYPE} from "../commons/models.ts";
import layer_OSM_Streets from "../assets/map-layers/OSM_Streets.png"
import layer_OSM_Humanitarian from "../assets/map-layers/OSM_Humanitarian.png"
import layer_OpenTopoMap from "../assets/map-layers/OpenTopoMap.png"
import layer_ESRI_Satellite from "../assets/map-layers/ESRI_Satellite.png"
import layer_ESRI_Topographic from "../assets/map-layers/ESRI_Topographic.png"
import layer_Carto_Light from "../assets/map-layers/Carto_Light.png"

/* Localization */
export const SUPPORTED_LANGUAGES = ["en", "ua"]

/* Routing section */
export const ROUTES = {
    ROOT: "/",
    MAP_ROUTES: {
        ROOT: "map",
        MARKER: "marker",
    },
    COMPUTER_VISION_DETECTION_ROUTES: {
        ROOT: "cv-detection",
        STATS_ROUTE: {
            ROOT: "stats",
            RAW_JSON: "raw"
        }
    },
    SIGN_IN: "sign-in",
    ACCOUNT_ROUTES: {
        ROOT: "account"
    },
    ADMIN_ROUTES: {
        ROOT: "admin",
        DASHBOARD: "dashboard",
        MAP_EDITOR: "map-editor"
    },
    NOT_FOUND: "*",
}

export const ROUTES_WITHOUT_MOUSE_TRAIL = [
    ...buildUrlForAllLanguages(ROUTES.MAP_ROUTES.ROOT, URL_TYPE.ABSOLUTE),
    ...buildUrlForAllLanguages(ROUTES.COMPUTER_VISION_DETECTION_ROUTES.ROOT, URL_TYPE.ABSOLUTE),
    ...buildUrlForAllLanguages([ROUTES.ADMIN_ROUTES.ROOT, ROUTES.ADMIN_ROUTES.DASHBOARD], URL_TYPE.ABSOLUTE),
    ...buildUrlForAllLanguages([ROUTES.ADMIN_ROUTES.ROOT, ROUTES.ADMIN_ROUTES.MAP_EDITOR], URL_TYPE.ABSOLUTE),
]

/* API URLS */
export const API_DOMAIN = "http://localhost:8080"
export const AI_CV_YOLO_URL = API_DOMAIN + "/api/ai/cv/yolo"
export const API_URLS = {
    AI_CV_YOLO_MODELS_DETAILS_URL: AI_CV_YOLO_URL + "/models/details",
    AI_CV_YOLO_DETECTIONS_URL: AI_CV_YOLO_URL + "/detections",
    AI_CV_YOLO_DETECTIONS_RESULTS_URL: AI_CV_YOLO_URL + "/detections/results",
}

/* Map section */
export const MAP_LAYERS = [
    {
        name: "OSM Standard",
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
        name: "OSM Topographic",
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

/* File name width for screen width */
export const TRUNCATE_FILE_NAME_RULES: TruncateFileNameRule[] = [
    {maxScreenWidth: 300, startFileNameLength: 3, endFileNameLength: 4},
    {maxScreenWidth: 500, startFileNameLength: 4, endFileNameLength: 6},
    {maxScreenWidth: 9999, startFileNameLength: 6, endFileNameLength: 9}, // desktop fallback
]

