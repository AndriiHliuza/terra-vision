import {useCallback, useEffect, useState} from "react";
import {ApplicationContext} from "./contexts";
import {axiosWebClient} from "../axios-web-client.ts";
import {PermissionStrategy, type User} from "../../commons/schemas/auth-schemas.ts";
import {Outlet, useNavigate, useParams} from "react-router-dom";
import defaultProfileImg from "../../assets/default-profile-img.png";
import axios from "axios";
import type {LoginFormData} from "../form-validation-schemas.ts";

const ApplicationContextProvider = () => {

    const [loading, setLoading] = useState(false);
    const [loadingBackground, setLoadingBackground] = useState<string | undefined>(undefined);

    const setLoadingLayout = (loading: boolean, background?: string) => {
        setLoading(loading);
        setLoadingBackground(loading ? background : undefined);
    };

    const navigate = useNavigate();
    const {lang} = useParams();
    const [forbidden, setForbidden] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [profileImage, setProfileImage] = useState<string>(defaultProfileImg);

    useEffect(() => {
        const controller = new AbortController();
        let profileImageUrl: string | null = null;
        axiosWebClient.get(`/api/users/${user?.id}/profile/image`, {
            signal: controller.signal,
            responseType: 'blob',
        }).then(res => {
            profileImageUrl = URL.createObjectURL(res.data);
            setProfileImage(profileImageUrl);
        }).catch(err => {
            if (axios.isCancel(err)) return;
        });
        return () => {
            controller.abort(); // Stops the fetch if user navigates away
            if (profileImageUrl) {
                URL.revokeObjectURL(profileImageUrl); // Releases the image from RAM
            }
        };
    }, [user?.id]);

    const handleUnauthorized = useCallback(() => {
        if (!user) return;
        setUser(null);
        navigate(`/${lang}/login`, {replace: true});
    }, [lang, navigate, user]);

    const handleForbidden = useCallback(() => {
        setForbidden(true);
    }, []);

    useEffect(() => {
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        window.addEventListener('auth:forbidden', handleForbidden);

        return () => {
            window.removeEventListener('auth:unauthorized', handleUnauthorized);
            window.removeEventListener('auth:forbidden', handleForbidden);
        };
    }, [handleForbidden, handleUnauthorized]);

    useEffect(() => {
        axiosWebClient.get<User>("/api/auth/me")
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
    }, []);

    const hasMinPowerLevel = (required: number): boolean =>
        (user?.role.powerLevel ?? 0) >= required;

    const hasRole = (role: string): boolean =>
        user?.role.name === role;

    const hasPermission = (permission: string): boolean =>
        user?.permissions.includes(permission) ?? false;

    const hasPermissions = (
        requiredPermissions: string[],
        strategy: PermissionStrategy = PermissionStrategy.ALL_OF
    ): boolean => {
        if (requiredPermissions.length === 0) return true;

        return strategy === PermissionStrategy.ALL_OF
            ? requiredPermissions.every(p => hasPermission(p))
            : requiredPermissions.some(p => hasPermission(p));
    };

    const login = async (data: LoginFormData): Promise<void> => {
        await axiosWebClient.post("/api/auth/login", data);
        const me = await axiosWebClient.get<User>("/api/auth/me");
        setUser(me.data);
        navigate(`/${lang}/account`, { replace: true });
    };

    const logout = async (): Promise<void> => {
        await axiosWebClient.post("/api/auth/logout");
        setUser(null);
    };

    return (
        <ApplicationContext.Provider value={{
            loading,
            loadingBackground,
            setLoadingLayout,

            user,
            isAuthenticated: !!user,

            hasMinPowerLevel,
            hasRole,
            hasPermission,
            hasPermissions,

            login,
            logout,

            profileImage,

            forbidden,
            setForbidden
        }}>
            <Outlet />
        </ApplicationContext.Provider>
    );
}

export default ApplicationContextProvider;