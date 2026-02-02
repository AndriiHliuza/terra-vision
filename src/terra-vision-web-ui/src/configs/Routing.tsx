import {Routes, Route, Navigate} from "react-router-dom";
import {ROUTES} from "./settings.ts";
import Home from "../pages/Home.tsx";
import Map from "../pages/Map.tsx";
import NotFound from "../pages/NotFound.tsx";
import LandmineDetector from "../pages/LandmineDetector.tsx";
import AdminDashboard from "../pages/AdminDashboard.tsx";
import AdminLayout from "../layouts/AdminLayout.tsx";
import MapEditor from "../pages/MapEditor.tsx";
import Localization from "./Localization.tsx";
import i18n from "./i18n.ts";

function Routing() {
    return (
        <Routes>

            <Route path={ROUTES.ROOT} element={<Navigate to={`/${i18n.language || 'en'}`} replace />} />

            <Route path=":lang/*" element={<Localization/>}>
                <Route index element={<Home/>}/>
                <Route path={ROUTES.LANDMINE_DETECTOR} element={<LandmineDetector/>}/>
                <Route path={ROUTES.MAP} element={<Map/>}/>
                <Route path={ROUTES.ADMIN_ROUTES.ROOT} element={<AdminLayout/>}>
                    <Route index element={<Navigate to={ROUTES.ADMIN_ROUTES.DASHBOARD} replace/>}/>
                    <Route path={ROUTES.ADMIN_ROUTES.DASHBOARD} element={<AdminDashboard/>}/>
                    <Route path={ROUTES.ADMIN_ROUTES.MAP_EDITOR} element={<MapEditor/>}/>
                </Route>
                <Route path={ROUTES.NOT_FOUND} element={<NotFound/>}/>
            </Route>
        </Routes>
    )
}

export default Routing;