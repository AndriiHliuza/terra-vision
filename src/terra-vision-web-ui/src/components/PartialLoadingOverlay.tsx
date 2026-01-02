import "../styles/components/PartialLoadingOverlay.css";
import loadingIcon from "../assets/loading-icon.gif";

function PartialLoadingOverlay({ visible }: { visible: boolean }) {

    if (!visible) return null;

    return (
        <div className="partial-loading-overlay">
            <img src={loadingIcon} alt="Loading" className="loading-image"/>
        </div>
    );
}

export default PartialLoadingOverlay;