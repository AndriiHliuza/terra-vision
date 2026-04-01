import "../../styles/components/map/MapPositionDetailsPopup.css";
import {useState} from "react";
import copyBtnImg from "../../assets/copy-btn-img.png";
import addBtnImg from "../../assets/plus.png";
import clsx from "clsx";
import {useMap} from "react-leaflet";
import {Slide, toast} from "react-toastify";
import type {Coordinates} from "../../commons/schemas/gis-schemas.ts";

interface MapPositionDetailsProps {
    coordinates: Coordinates;
    onAddClicked?: () => void;
}

function MapPositionPopupDetails({coordinates, onAddClicked}: MapPositionDetailsProps) {

    const map = useMap();
    const [copied, setCopied] = useState(false);

    const handleAddMarkerBtnClicked = () => {
        map.closePopup();
        if (onAddClicked) { onAddClicked(); }
    }

    const handleCopy = async () => {
        const text = `${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)}`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);

        toast("Copied to clipboard", {
            position: "bottom-center",
            autoClose: 1000, // time in milliseconds
            hideProgressBar: true,
            closeButton: false,
            icon: false,
            className: "copy-coordinates-toast",
            transition: Slide
        });
    };

    return (
        <div className={clsx("map-position-popup" , {
            "on-add-present": onAddClicked
        })}>
            <div className="coordinates">
                <div className="coordinate">
                    <div>Lat</div>
                    <div>{coordinates.lat.toFixed(6)}</div>
                </div>
                <div className="coordinate">
                    <div>Lng</div>
                    <div>{coordinates.lng.toFixed(6)}</div>
                </div>
            </div>
            <div className="controls">
                {onAddClicked && (
                    <>
                        <button
                            className="add-marker-btn"
                            onClick={handleAddMarkerBtnClicked}
                            title="Add marker"
                        >
                            <img src={addBtnImg} alt="Add"/>
                        </button>
                    </>
                )}

                <button
                    className={clsx("copy-coordinates-btn", {"copied": copied})}
                    onClick={handleCopy}
                    disabled={copied}
                    title="Copy coordinates"
                >
                    <img src={copyBtnImg} alt="Copy"/>
                </button>
            </div>
        </div>
    )
}

export default MapPositionPopupDetails;