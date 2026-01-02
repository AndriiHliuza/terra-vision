import {type PropsWithChildren, useState} from "react";
import { ApplicationContext } from "../settings.ts";

const ApplicationContextProvider = ({ children }: PropsWithChildren) => {
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