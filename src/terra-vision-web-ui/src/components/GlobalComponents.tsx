import BackToTopBtn from "./BackToTopBtn.tsx";
import MouseTrail from "./MouseTrail.tsx";
import {ToastContainer} from "react-toastify";
import LoadingOverlay from "./LoadingOverlay.tsx";
import {useContext} from "react";
import {ApplicationContext, type ApplicationContextData} from "../configs/context/contexts.ts";

const GlobalComponents = () => {

    const { loading } = useContext(ApplicationContext) as ApplicationContextData;

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

export default GlobalComponents;