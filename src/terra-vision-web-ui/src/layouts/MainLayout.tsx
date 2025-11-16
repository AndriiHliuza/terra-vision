import {Outlet} from "react-router-dom";
import BackToTopBtn from "../components/BackToTopBtn.tsx";
import MouseTrail from "../components/MouseTrail.tsx";

const MainLayout = () => {
    return (
        <>
            <MouseTrail />
            <Outlet />
            <BackToTopBtn />
        </>
    )
}

export default MainLayout