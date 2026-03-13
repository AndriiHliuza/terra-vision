import "../styles/components/LoadingOverlay.css";
import loadingIcon from "../assets/loading-icon.gif";

function LoadingOverlay({ visible, background }: { visible: boolean; background?: string }) {

    if (!visible) return null;

    return (
        <div
            className="loading-overlay"
            style={background ? {background: background} : undefined}
        >
            <img src={loadingIcon} alt="Loading" className="loading-image"/>
        </div>
    );
}

export default LoadingOverlay;