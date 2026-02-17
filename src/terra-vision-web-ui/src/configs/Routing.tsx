import {Routes, Route, Navigate} from "react-router-dom";
import {ROUTES} from "./settings.ts";
import Home from "../pages/Home.tsx";
import Map from "../pages/Map.tsx";
import NotFound from "../pages/NotFound.tsx";
import ComputerVisionPage from "../pages/ComputerVisionPage.tsx";
import AdminDashboard from "../pages/AdminDashboard.tsx";
import AdminLayout from "../layouts/AdminLayout.tsx";
import MapEditor from "../pages/MapEditor.tsx";
import Localization from "./Localization.tsx";
import i18n from "./i18n.ts";
import {SimpleChartPage} from "../components/SimpleChartPage.tsx";
import CVStatsPage from "../pages/CVStatsPage.tsx";
import CVStatsRawJSONPage from "../pages/CVStatsRawJSONPage.tsx";

function Routing() {
    return (
        <Routes>

            <Route path={ROUTES.ROOT} element={<Navigate to={`/${i18n.language || 'en'}`} replace />} />

            <Route path=":lang/*" element={<Localization/>}>
                <Route index element={<Home/>}/>
                <Route path={ROUTES.COMPUTER_VISION_DETECTION_ROUTES.ROOT}>
                    <Route index element={<ComputerVisionPage/>}/>
                    <Route path={ROUTES.COMPUTER_VISION_DETECTION_ROUTES.STATS_ROUTE.ROOT}>
                        <Route index element={<CVStatsPage />}/>
                        <Route path={ROUTES.COMPUTER_VISION_DETECTION_ROUTES.STATS_ROUTE.RAW_JSON} element={<CVStatsRawJSONPage />} />
                    </Route>
                </Route>
                <Route path={ROUTES.MAP_ROUTES.ROOT}>
                    <Route index element={<Map/>}/>
                    <Route path={ROUTES.MAP_ROUTES.MARKER} element={<div>Marker Page</div>} />
                </Route>
                <Route path={ROUTES.ADMIN_ROUTES.ROOT} element={<AdminLayout/>}>
                    <Route index element={<Navigate to={ROUTES.ADMIN_ROUTES.DASHBOARD} replace/>}/>
                    <Route path={ROUTES.ADMIN_ROUTES.DASHBOARD} element={<AdminDashboard/>}/>
                    <Route path={ROUTES.ADMIN_ROUTES.MAP_EDITOR} element={<MapEditor/>}/>
                </Route>
                <Route path="charts" element={<SimpleChartPage/>}/>
                <Route path={ROUTES.NOT_FOUND} element={<NotFound/>}/>
            </Route>
        </Routes>
    )
}

export default Routing;