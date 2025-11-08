import {BrowserRouter, Routes, Route} from "react-router-dom";
import {ROUTES} from "./settings.ts";
import MainLayout from "../layouts/MainLayout.tsx";
import Home from "../pages/Home.tsx";
import Map from "../pages/Map.tsx";
import NotFound from "../pages/NotFound.tsx";

function RoutesConfig() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<MainLayout/>}>
                    <Route path={ROUTES.home} element={<Home />}/>
                    <Route path={ROUTES.map} element={<Map />}/>
                </Route>
                <Route path={ROUTES.notFound} element={<NotFound />}/>
            </Routes>
        </BrowserRouter>
    )
}

export default RoutesConfig