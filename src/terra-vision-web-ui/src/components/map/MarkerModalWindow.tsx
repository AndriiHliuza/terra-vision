import type {Coordinates, MarkerData} from "../../commons/schemas/gis-schemas.ts";

interface MarkerModalWindowProps {
    coordinates: Coordinates;
    onClose: () => void;
    onSave: (data: MarkerData) => void;
}

function MarkerModalWindow({coordinates, onClose, onSave}: MarkerModalWindowProps) {
    return (
        <div>
            <div>{`${coordinates.lat}-${coordinates.lng}`}</div>
            <button onClick={onClose}>Close</button>
        </div>
    )
}

export default MarkerModalWindow;