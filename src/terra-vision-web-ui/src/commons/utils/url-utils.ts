/* <<<<<<<<<<<< schemas >>>>>>>>>>>> */
export const URL_TYPE = {
    ABSOLUTE: "absolute",
    RELATIVE: "relative",
} as const;

export type UrlType = (typeof URL_TYPE)[keyof typeof URL_TYPE];

export const urlBuilders: Record<UrlType, (u: string) => string> = {
    [URL_TYPE.ABSOLUTE]: (u) => "/" + u,
    [URL_TYPE.RELATIVE]: (u) => u,
};



/* <<<<<<<<<<<< functions >>>>>>>>>>>> */
export function buildUrl(
    urlSegments: string | string[],
    urlType: UrlType = URL_TYPE.ABSOLUTE
): string {
    let url: string;

    if (Array.isArray(urlSegments)) {
        const cleanedSegments = urlSegments.map(s => s.replace(/\//g, ""));
        url = cleanedSegments.filter(Boolean).join("/");
    } else {
        url = urlSegments.replace(/\//g, "");
    }

    return urlBuilders[urlType](url);
}
