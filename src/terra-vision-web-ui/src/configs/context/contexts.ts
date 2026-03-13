import {createContext, type Dispatch, type SetStateAction, useContext} from "react";
import type {PermissionStrategy, User} from "../../commons/schemas/auth-schemas.ts";

export type ApplicationContextData = {
    loading: boolean;
    loadingBackground: string | undefined;
    setLoadingLayout: (loading: boolean, background?: string) => void;

    user: User | null;
    isAuthenticated:  boolean;

    hasMinPowerLevel: (required: number) => boolean;
    hasRole: (role: string) => boolean;
    hasPermission: (permission: string) => boolean;
    hasPermissions: (permissions: string[], strategy?: PermissionStrategy) => boolean;

    logout: () => Promise<void>;

    profileImage: string;

    forbidden: boolean;
    setForbidden: Dispatch<SetStateAction<boolean>>;
};

export const ApplicationContext = createContext<ApplicationContextData | undefined>(undefined);

export const useAppContext = (): ApplicationContextData => {
    const context = useContext(ApplicationContext) as ApplicationContextData;
    if (!context) throw new Error('useAppContext must be used within ApplicationContextProvider');
    return context;
};