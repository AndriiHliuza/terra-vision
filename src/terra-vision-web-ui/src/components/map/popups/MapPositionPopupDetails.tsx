import "../../../styles/components/map/popups/MapPositionPopupDetails.css";
import {useState} from "react";
import copyBtnImg from "../../../assets/copy-btn-img.png";
import clsx from "clsx";
import {Slide, toast} from "react-toastify";
import type {Coordinates} from "../../../commons/schemas/gis-schemas.ts";

function MapPositionPopupDetails({coordinates}: { coordinates: Coordinates }) {

    const [copied, setCopied] = useState(false);

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
        <div className="map-position-popup">
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
                <button
                    className={clsx({"copied": copied})}
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