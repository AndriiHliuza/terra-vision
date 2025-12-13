import {type ReactNode, useState} from "react";
import { ApplicationContext } from "../settings.ts";

type ApplicationContextProviderProps = {
    children: ReactNode;
}

const ApplicationContextProvider = ({ children }: ApplicationContextProviderProps) => {
    const [loading, setLoading] = useState(false);

    return (
        <ApplicationContext.Provider value={{
            loading,
            setLoading
        }}>
            {children}
        </ApplicationContext.Provider>
    );
}

export default ApplicationContextProvider;