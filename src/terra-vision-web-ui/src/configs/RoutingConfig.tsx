import {BrowserRouter, Routes, Route} from "react-router-dom";
import {ROUTES} from "./settings.ts";
import Home from "../pages/Home.tsx";
import Map from "../pages/Map.tsx";
import NotFound from "../pages/NotFound.tsx";
import LandmineDetectionServicePage from "../pages/LandmineDetectionServicePage.tsx";
import SharedComponents from "./SharedComponents.tsx";

function RoutingConfig() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={ROUTES.home} element={<Home/>}/>
                <Route path={ROUTES.landmineDetectionService} element={<LandmineDetectionServicePage/>}/>
                <Route path={ROUTES.map} element={<Map/>}/>
                <Route path={ROUTES.notFound} element={<NotFound/>}/>
            </Routes>
            <SharedComponents/>
        </BrowserRouter>
    )
}

export default RoutingConfig;