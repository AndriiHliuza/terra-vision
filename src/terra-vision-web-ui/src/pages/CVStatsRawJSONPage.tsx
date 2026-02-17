import {useContext} from "react";
import {ApplicationContext} from "../configs/context/contexts.ts";
import NotFound from "./NotFound.tsx";

function CVStatsRawJSONPage() {

    const applicationContext = useContext(ApplicationContext);
    if (!applicationContext) throw new Error("ApplicationContext not found");

    const stats = applicationContext?.CV_DETECTION?.PROCESSED_DATA?.stats;

    if (!stats) return <NotFound/>

    return (
        <pre style={{
            margin: 0,
            padding: 0,
            whiteSpace: "pre",
            textAlign: "left",
            fontFamily: "monospace"
        }}>{JSON.stringify(stats, null, 2)}</pre>
    );
}

export default CVStatsRawJSONPage;