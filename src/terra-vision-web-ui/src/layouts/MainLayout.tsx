import {Outlet} from "react-router-dom";
import BackToTopBtn from "../components/BackToTopBtn.tsx";
import MouseTrail from "../components/MouseTrail.tsx";
import {ToastContainer} from "react-toastify";

const MainLayout = () => {
    return (
        <>
            <MouseTrail />
            <Outlet />
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

export default MainLayout