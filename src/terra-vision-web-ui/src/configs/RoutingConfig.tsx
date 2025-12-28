import {BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
import {ROUTES} from "./settings.ts";
import Home from "../pages/Home.tsx";
import Map from "../pages/Map.tsx";
import NotFound from "../pages/NotFound.tsx";
import LandmineDetectionServicePage from "../pages/LandmineDetectionServicePage.tsx";
import AdminDashboard from "../pages/AdminDashboard.tsx";
import AdminLayout from "../layouts/AdminLayout.tsx";
import ApplicationLayout from "../layouts/ApplicationLayout.tsx";
import MapEditor from "../pages/MapEditor.tsx";
import Services from "../pages/Services.tsx";

function RoutingConfig() {
    return (
        <BrowserRouter>
            <ApplicationLayout>
                <Routes>
                    <Route path={ROUTES.home} element={<Home/>}/>
                    <Route path={ROUTES.services} element={<Services/>}/>
                    <Route path={ROUTES.landmineDetectionService} element={<LandmineDetectionServicePage/>}/>
                    <Route path={ROUTES.map} element={<Map/>}/>
                    <Route path={ROUTES.admin.route} element={<AdminLayout/>}>
                        <Route index element={<Navigate to={ROUTES.admin.subroutes.dashboard} replace />} />
                        <Route path={ROUTES.admin.subroutes.dashboard} element={<AdminDashboard />} />
                        <Route path={ROUTES.admin.subroutes.mapEditor} element={<MapEditor/>}/>
                    </Route>
                    <Route path={ROUTES.notFound} element={<NotFound/>}/>
                </Routes>
            </ApplicationLayout>
        </BrowserRouter>
    )
}

export default RoutingConfig;