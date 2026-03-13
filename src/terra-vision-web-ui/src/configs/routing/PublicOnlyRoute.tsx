import {Navigate, Outlet, useParams} from "react-router-dom";
import {useAppContext} from "../context/contexts.ts";

type PublicOnlyRouteProps = {
    redirectTo?: string;
};

function PublicOnlyRoute({ redirectTo }: PublicOnlyRouteProps) {
    const { lang } = useParams();
    const { isAuthenticated } = useAppContext();

    if (isAuthenticated) {
        const destination = redirectTo ?? `/${lang}/account`;
        return <Navigate to={destination} replace />;
    }

    return <Outlet />;
}

export default PublicOnlyRoute;