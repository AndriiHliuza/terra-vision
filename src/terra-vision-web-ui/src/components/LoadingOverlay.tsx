import '../styles/components/LoadingOverlay.css'
import loadingIcon from "../assets/loading-icon.gif";

type LoadingOverlayProps = {
    visible: boolean;
}

function LoadingOverlay({ visible }: LoadingOverlayProps) {

    if (!visible) return null;

    return (
        <div className="loading-overlay">
            <img src={loadingIcon} alt="Loading" className="loading-image"/>
        </div>
    );
}

export default LoadingOverlay