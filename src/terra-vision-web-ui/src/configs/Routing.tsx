import {Routes, Route, Navigate} from "react-router-dom";
import {ROUTES} from "./settings.ts";
import Home from "../pages/Home.tsx";
import Map from "../pages/Map.tsx";
import NotFound from "../pages/NotFound.tsx";
import CVDetectionPage from "../pages/CVDetectionPage.tsx";
import AdminDashboard from "../pages/AdminDashboard.tsx";
import AdminLayout from "../layouts/AdminLayout.tsx";
import MapEditor from "../pages/MapEditor.tsx";
import Localization from "./Localization.tsx";
import i18n from "./i18n.ts";
import {SimpleChartPage} from "../components/SimpleChartPage.tsx";
import ProtectedRoute from "../layouts/ProtectedRoute.tsx";
import {SystemRoleLevels} from "../commons/schemas/auth-schemas.ts";

function Routing() {
    return (
        <Routes>

            <Route path={ROUTES.ROOT} element={<Navigate to={`/${i18n.language || 'en'}`} replace />} />

            <Route path=":lang/*" element={<Localization/>}>
                <Route index element={<Home/>}/>
                <Route path={ROUTES.COMPUTER_VISION_DETECTION_ROUTES.ROOT}>
                    <Route index element={<CVDetectionPage/>}/>
                </Route>
                <Route path={ROUTES.MAP_ROUTES.ROOT}>
                    <Route index element={<Map/>}/>
                    <Route path={ROUTES.MAP_ROUTES.MARKER} element={<div>Marker Page</div>} />
                </Route>
                <Route element={<ProtectedRoute minPowerLevel={SystemRoleLevels.ADMIN}/>}>
                    <Route path={ROUTES.ADMIN_ROUTES.ROOT} element={<AdminLayout/>}>
                        <Route index element={<Navigate to={ROUTES.ADMIN_ROUTES.DASHBOARD} replace/>}/>
                        <Route path={ROUTES.ADMIN_ROUTES.DASHBOARD} element={<AdminDashboard/>}/>
                        <Route path={ROUTES.ADMIN_ROUTES.MAP_EDITOR} element={<MapEditor/>}/>
                    </Route>
                </Route>
                <Route path="charts" element={<SimpleChartPage/>}/>
                <Route path={ROUTES.NOT_FOUND} element={<NotFound/>}/>
            </Route>
        </Routes>
    )
}

export default Routing;