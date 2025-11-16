import {BrowserRouter, Routes, Route} from "react-router-dom";
import {ROUTES} from "./settings.ts";
import MainLayout from "../layouts/MainLayout.tsx";
import Home from "../pages/Home.tsx";
import Map from "../pages/Map.tsx";
import NotFound from "../pages/NotFound.tsx";
import LandmineDetectionServicePage from "../pages/LandmineDetectionServicePage.tsx";

function RoutesConfig() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout/>}>
                    <Route path={ROUTES.home} element={<Home/>}/>
                    <Route path={ROUTES.landmineDetectionService} element={<LandmineDetectionServicePage/>}/>
                    <Route path={ROUTES.map} element={<Map/>}/>
                    <Route path={ROUTES.notFound} element={<NotFound/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}

export default RoutesConfig