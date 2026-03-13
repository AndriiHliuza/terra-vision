import {createBrowserRouter, Navigate} from "react-router-dom";
import ApplicationContextProvider from "../context/ApplicationContextProvider.tsx";
import i18n from "../i18n.ts";
import LocalizationRoute from "./LocalizationRoute.tsx";
import CVDetectionPage from "../../pages/CVDetectionPage.tsx";
import Map from "../../pages/Map.tsx";
import PublicOnlyRoute from "./PublicOnlyRoute.tsx";
import RegistrationPage from "../../pages/RegistrationPage.tsx";
import LoginPage from "../../pages/LoginPage.tsx";
import ProtectedRoute from "./ProtectedRoute.tsx";
import {SystemRoleLevels} from "../../commons/schemas/auth-schemas.ts";
import AdminLayout from "../../layouts/AdminLayout.tsx";
import AdminDashboard from "../../pages/AdminDashboard.tsx";
import MapEditor from "../../pages/MapEditor.tsx";
import {SimpleChartPage} from "../../components/SimpleChartPage.tsx";
import NotFound from "../../pages/NotFound.tsx";
import Home from "../../pages/Home.tsx";

export const router = createBrowserRouter([
    {
        element: <ApplicationContextProvider />,
        children: [
            {
                path: "/",
                element: <Navigate to={`/${i18n.language || 'en'}`} replace />
            },
            {
                path: ":lang",
                element: <LocalizationRoute />,
                children: [
                    { index: true, element: <Home /> },
                    { path: "detector", element: <CVDetectionPage /> },
                    {
                        path: "map",
                        children: [
                            { index: true, element: <Map /> },
                            { path: "marker", element: <div>Marker Page</div> }
                        ]
                    },
                    {
                        element: <PublicOnlyRoute />,
                        children: [
                            { path: "login",    element: <LoginPage /> },
                            { path: "sign-in", element: <RegistrationPage /> },
                        ]
                    },
                    {
                        element: <ProtectedRoute minPowerLevel={SystemRoleLevels.USER} />,
                        children: [
                            { path: "account", element: <div>User account</div> }
                        ]
                    },
                    {
                        element: <ProtectedRoute minPowerLevel={SystemRoleLevels.ADMIN} />,
                        children: [
                            {
                                path: "admin",
                                element: <AdminLayout />,
                                children: [
                                    { index: true, element: <Navigate to="dashboard" replace /> },
                                    { path: "dashboard", element: <AdminDashboard /> },
                                    { path: "map-editor", element: <MapEditor /> }
                                ]
                            }
                        ]
                    },
                    { path: "charts", element: <SimpleChartPage /> },
                    { path: "*", element: <NotFound /> }
                ]
            }
        ]
    }
])