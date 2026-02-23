import {type PropsWithChildren, useState} from "react";
import { ApplicationContext } from "./contexts";

const ApplicationContextProvider = ({ children }: PropsWithChildren) => {
    const [loading, setLoading] = useState(false);

    return (
        <ApplicationContext.Provider value={{
            USER: null,
            loading,
            setLoading,
        }}>
            {children}
        </ApplicationContext.Provider>
    );
}

export default ApplicationContextProvider;