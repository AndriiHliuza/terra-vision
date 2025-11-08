import {Outlet} from "react-router-dom";
import Header from "../components/Header.tsx";
import Footer from "../components/Footer.tsx";
import BackToTopBtn from "../components/BackToTopBtn.tsx";
import MouseTrail from "../components/MouseTrail.tsx";

const MainLayout = () => {
    return (
        <>
            <MouseTrail />
            <Header />
            <Outlet />
            <Footer />
            <BackToTopBtn />
        </>
    )
}

export default MainLayout