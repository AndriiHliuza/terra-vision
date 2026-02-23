import "../styles/pages/CVStatsPage.css";
import {useContext, useEffect} from "react";
import {ApplicationContext} from "../configs/context/contexts.ts";
import NotFound from "./NotFound.tsx";
import {Link} from "react-router-dom";
import Header from "../components/Header.tsx";
import {ROUTES} from "../configs/settings.ts";
import type {CVClassStats, CVImageStats} from "../commons/models.ts";

function CVDetectionStatsPage() {
    const applicationContext = useContext(ApplicationContext);
    if (!applicationContext) throw new Error("ApplicationContext not found");

    useEffect(() => {
       console.log(applicationContext?.CV_DETECTION?.PROCESSED_DATA?.stats) 
    }, [applicationContext?.CV_DETECTION?.PROCESSED_DATA?.stats])
    
    if (
        !applicationContext ||
        !applicationContext.CV_DETECTION ||
        !applicationContext.CV_DETECTION.PROCESSED_DATA.images ||
        !applicationContext.CV_DETECTION.PROCESSED_DATA.archives ||
        !applicationContext.CV_DETECTION.PROCESSED_DATA.stats
    ) return <NotFound/>

    const perClassStats: Record<string, CVClassStats> = applicationContext.CV_DETECTION.PROCESSED_DATA.stats.overall_stats.per_class_stats;
    const perImageStats: CVImageStats[] = applicationContext.CV_DETECTION.PROCESSED_DATA.stats.overall_stats.per_image_stats;

    return (
        <div className="cv-stats-page">
            <Header />
            <main>
                <div className="stats-wrapper">
                    <div>
                        <Link to={ROUTES.COMPUTER_VISION_DETECTION_ROUTES.STATS_ROUTE.RAW_JSON} >LInk</Link>
                    </div>
                    <h2>Overall</h2>
                    <div>Model: {applicationContext.CV_DETECTION.PROCESSED_DATA.stats.model_id}</div>
                    <div>Total images: {applicationContext.CV_DETECTION.PROCESSED_DATA.stats.overall_stats.total_images}</div>
                    <div>Successfully processed images: {applicationContext.CV_DETECTION.PROCESSED_DATA.stats.overall_stats.successfully_processed_images}</div>
                    <div>Number of failed images: {applicationContext.CV_DETECTION.PROCESSED_DATA.stats.overall_stats.failed_images}</div>
                    <div>Total detection: {applicationContext.CV_DETECTION.PROCESSED_DATA.stats.overall_stats.total_detections}</div>
                    <div>Number of images with detections: {applicationContext.CV_DETECTION.PROCESSED_DATA.stats.overall_stats.images_with_detections}</div>
                    <div>Processing time: {applicationContext.CV_DETECTION.PROCESSED_DATA.stats.overall_stats.processing_time_seconds}</div>
                    <div>Average confidence: {applicationContext.CV_DETECTION.PROCESSED_DATA.stats.overall_stats.average_confidence}</div>
                    <div>Average detections per image: {applicationContext.CV_DETECTION.PROCESSED_DATA.stats.overall_stats.average_detections_per_image}</div>
                    <div>Percentage of images with detection: {applicationContext.CV_DETECTION.PROCESSED_DATA.stats.overall_stats.percentage_of_images_with_detection}</div>
                    <h2>Per class stats</h2>
                    {Object.entries(perClassStats).map(([className, stats]) => (
                        <div key={className} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px" }}>
                            <h3>{stats.class_name}</h3>
                            <p><strong>Total Detections:</strong> {stats.total_detections}</p>
                            <p><strong>Images Containing Class:</strong> {stats.images_containing_class}</p>
                            <p><strong>Average Confidence:</strong> {stats.average_confidence}</p>
                            <p><strong>Min Confidence:</strong> {stats.min_confidence}</p>
                            <p><strong>Max Confidence:</strong> {stats.max_confidence}</p>
                        </div>
                    ))}
                    <h2>Per image stats</h2>
                    {perImageStats.map((imageStats) => (
                        <div key={imageStats.filename} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px", backgroundColor: "blanchedalmond" }}>
                            <h3>{imageStats.filename}</h3>
                            <p><strong>Number of Detections:</strong> {imageStats.num_detections}</p>
                            <p><strong>Average Confidence:</strong> {imageStats.average_confidence}</p>
                            <p><strong>Max Confidence:</strong> {imageStats.max_confidence}</p>
                            <p><strong>Successfully Processed:</strong> {imageStats.is_successfully_processed ? "Yes" : "No"}</p>

                            {imageStats.detections.length > 0 && (
                                <div style={{ marginTop: "10px", paddingLeft: "10px", backgroundColor: "green" }}>
                                    <h3>Detections:</h3>
                                    {imageStats.detections.map((det, idx) => (
                                        <div key={idx} style={{ borderTop: "1px dashed #aaa", padding: "5px 0", backgroundColor: "greenyellow" }}>
                                            <p><strong>Class:</strong> {det.classname}</p>
                                            <p><strong>Confidence:</strong> {det.confidence}</p>
                                            <p><strong>Bounding Box:</strong> ({det.x1}, {det.y1}) - ({det.x2}, {det.y2})</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default CVDetectionStatsPage;