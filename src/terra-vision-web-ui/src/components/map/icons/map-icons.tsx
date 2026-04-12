import L from "leaflet";
import {renderToStaticMarkup} from "react-dom/server";
import {ClusterIcon} from "./ClusterIcon.tsx";
import {DEFAULT_FEATURE_STYLE} from "../../../commons/schemas/gis-schemas.ts";


export const createClusterIcon = (cluster: { getChildCount: () => number }) => {
    const count = cluster.getChildCount();

    return new L.DivIcon({
        className: "",
        html: renderToStaticMarkup(<ClusterIcon count={count}/>),
        iconSize: [30, 30],
        iconAnchor: [15, 30],
    });
};

const createMarkerSvg = (fillColor: string, borderColor: string, opacity: number = 1) => `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     style="opacity: ${opacity}; display: block; width: 30px; height: 35px;">
    <defs>
        <path id="mk-a" d="M5,2 C4.44771525,2 4,1.55228475 4,1 C4,0.44771525 4.44771525,0 5,0 C5.55228475,0 6,0.44771525 6,1 C6,1.55228475 5.55228475,2 5,2 Z M11.1660156,4.88720703 C11.5270182,4.88753255 11.0398763,6.09019866 9.70458984,8.49520536 C8.36930339,10.9002121 6.80110677,12.8476111 5,14.3374023 C3.47981771,13.1349284 1.89029948,11.2677409 0.231445312,8.73583984 C1.1640625,9.98632812 3.83496094,10.6665039 5.96948242,7.01611328 C7.39249674,4.58251953 9.12467448,3.87288411 11.1660156,4.88720703 Z"></path>
        <path id="mk-c" d="M8,22 C5.23620113,22 0,12.5164513 0,8.162063 C0,3.65933791 3.57653449,0 8,0 C12.4234655,0 16,3.65933791 16,8.162063 C16,12.5164513 10.7637989,22 8,22 Z M8,20 C8.39916438,20 9.97421309,18.1222923 11.3773555,15.5809901 C12.9364167,12.7572955 14,9.79929622 14,8.162063 C14,4.75379174 11.308521,2 8,2 C4.69147901,2 2,4.75379174 2,8.162063 C2,9.79929622 3.06358328,12.7572955 4.62264452,15.5809901 C6.02578691,18.1222923 7.60083562,20 8,20 Z M8,12 C5.790861,12 4,10.209139 4,8 C4,5.790861 5.790861,4 8,4 C10.209139,4 12,5.790861 12,8 C12,10.209139 10.209139,12 8,12 Z M8,10 C9.1045695,10 10,9.1045695 10,8 C10,6.8954305 9.1045695,6 8,6 C6.8954305,6 6,6.8954305 6,8 C6,9.1045695 6.8954305,10 8,10 Z"></path>
    </defs>
    <g fill="none" fill-rule="evenodd" transform="translate(4 1)">
        <g transform="translate(3 7)">
            <mask id="mk-b" fill="#ffffff"><use xlink:href="#mk-a"></use></mask>
            <use fill="#D8D8D8" xlink:href="#mk-a"></use>
            <g fill="${fillColor}" mask="url(#mk-b)">
                <rect width="24" height="24" transform="translate(-7 -8)"></rect>
            </g>
        </g>
        <mask id="mk-d" fill="#ffffff"><use xlink:href="#mk-c"></use></mask>
        <use fill="#000000" fill-rule="nonzero" xlink:href="#mk-c"></use>
        <g fill="${borderColor}" mask="url(#mk-d)">
            <rect width="24" height="24" transform="translate(-4 -1)"></rect>
        </g>
    </g>
</svg>`;

export const createMarkerIcon = (
    fillColor: string = DEFAULT_FEATURE_STYLE.fillColor,
    borderColor: string = DEFAULT_FEATURE_STYLE.borderColor,
    opacity: number = 1
) => {
    return new L.DivIcon({
        className: "",
        html: createMarkerSvg(fillColor, borderColor, opacity),
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
    });
};


/* ------------ For MapPage icon (Slightly different width pixel values for svg)------------ */
const createMapPageMarkerSvg = (fillColor: string, borderColor: string, opacity: number = 1) => `
<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     style="opacity: ${opacity}; display: block; width: 29px; height: 35px;">
    <defs>
        <path id="mk-a" d="M5,2 C4.44771525,2 4,1.55228475 4,1 C4,0.44771525 4.44771525,0 5,0 C5.55228475,0 6,0.44771525 6,1 C6,1.55228475 5.55228475,2 5,2 Z M11.1660156,4.88720703 C11.5270182,4.88753255 11.0398763,6.09019866 9.70458984,8.49520536 C8.36930339,10.9002121 6.80110677,12.8476111 5,14.3374023 C3.47981771,13.1349284 1.89029948,11.2677409 0.231445312,8.73583984 C1.1640625,9.98632812 3.83496094,10.6665039 5.96948242,7.01611328 C7.39249674,4.58251953 9.12467448,3.87288411 11.1660156,4.88720703 Z"></path>
        <path id="mk-c" d="M8,22 C5.23620113,22 0,12.5164513 0,8.162063 C0,3.65933791 3.57653449,0 8,0 C12.4234655,0 16,3.65933791 16,8.162063 C16,12.5164513 10.7637989,22 8,22 Z M8,20 C8.39916438,20 9.97421309,18.1222923 11.3773555,15.5809901 C12.9364167,12.7572955 14,9.79929622 14,8.162063 C14,4.75379174 11.308521,2 8,2 C4.69147901,2 2,4.75379174 2,8.162063 C2,9.79929622 3.06358328,12.7572955 4.62264452,15.5809901 C6.02578691,18.1222923 7.60083562,20 8,20 Z M8,12 C5.790861,12 4,10.209139 4,8 C4,5.790861 5.790861,4 8,4 C10.209139,4 12,5.790861 12,8 C12,10.209139 10.209139,12 8,12 Z M8,10 C9.1045695,10 10,9.1045695 10,8 C10,6.8954305 9.1045695,6 8,6 C6.8954305,6 6,6.8954305 6,8 C6,9.1045695 6.8954305,10 8,10 Z"></path>
    </defs>
    <g fill="none" fill-rule="evenodd" transform="translate(4 1)">
        <g transform="translate(3 7)">
            <mask id="mk-b" fill="#ffffff"><use xlink:href="#mk-a"></use></mask>
            <use fill="#D8D8D8" xlink:href="#mk-a"></use>
            <g fill="${fillColor}" mask="url(#mk-b)">
                <rect width="24" height="24" transform="translate(-7 -8)"></rect>
            </g>
        </g>
        <mask id="mk-d" fill="#ffffff"><use xlink:href="#mk-c"></use></mask>
        <use fill="#000000" fill-rule="nonzero" xlink:href="#mk-c"></use>
        <g fill="${borderColor}" mask="url(#mk-d)">
            <rect width="24" height="24" transform="translate(-4 -1)"></rect>
        </g>
    </g>
</svg>`;

export const createMapPageMarkerIcon = (
    fillColor: string = DEFAULT_FEATURE_STYLE.fillColor,
    borderColor: string = DEFAULT_FEATURE_STYLE.borderColor,
    opacity: number = 1
) => {
    return new L.DivIcon({
        className: "",
        html: createMapPageMarkerSvg(fillColor, borderColor, opacity),
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
    });
};