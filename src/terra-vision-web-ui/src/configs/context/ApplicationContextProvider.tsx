import {type PropsWithChildren, useEffect, useState} from "react";
import { ApplicationContext } from "./contexts";
import {axiosWebClient} from "../axiosWebClient.ts";
import {API_URLS} from "../settings.ts";
import {PermissionStrategy, type User} from "../../commons/schemas/auth-schemas.ts";

const ApplicationContextProvider = ({ children }: PropsWithChildren) => {
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setLoading(true);
        axiosWebClient.get<User>(API_URLS.ME)
            .then(res => setUser(res.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
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
            ? requiredPermissions.every(p  => hasPermission(p))
            : requiredPermissions.some(p   => hasPermission(p));
    };

    const logout = async (): Promise<void> => {
        await axiosWebClient.post(API_URLS.LOGOUT);
        setUser(null);
    };


    return (
        <ApplicationContext.Provider value={{
            loading,
            setLoading,

            user,
            isAuthenticated: !!user,

            hasMinPowerLevel,
            hasRole,
            hasPermission,
            hasPermissions,

            logout
        }}>
            {children}
        </ApplicationContext.Provider>
    );
}

export default ApplicationContextProvider;