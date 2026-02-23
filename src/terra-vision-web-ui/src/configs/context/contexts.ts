import {createContext, type Dispatch, type SetStateAction} from "react";
import type {User} from "../../commons/models.ts";

export type ApplicationContextData = {
    USER: User | null;
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
};

export const ApplicationContext = createContext<ApplicationContextData | undefined>(undefined);
