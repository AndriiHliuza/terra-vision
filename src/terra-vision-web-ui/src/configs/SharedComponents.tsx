import BackToTopBtn from "../components/BackToTopBtn.tsx";
import MouseTrail from "../components/MouseTrail.tsx";
import {ToastContainer} from "react-toastify";
import LoadingOverlay from "../components/LoadingOverlay.tsx";
import {useContext} from "react";
import {ApplicationContext, type ApplicationContextSettings} from "./settings.ts";

const SharedComponents = () => {

    const { loading } = useContext(ApplicationContext) as ApplicationContextSettings;

    return (
        <>
            <LoadingOverlay visible={loading}/>
            <MouseTrail />
            <BackToTopBtn />
            <ToastContainer
                position="bottom-left"
                autoClose={5000}
                newestOnTop={true}
                closeOnClick={true}
                pauseOnHover={true}
                draggable={true}
                theme="colored"
            />
        </>
    )
}

export default SharedComponents;