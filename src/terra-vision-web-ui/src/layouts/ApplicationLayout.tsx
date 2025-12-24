import SharedComponents from "../components/SharedComponents.tsx";
import type {ReactNode} from "react";

function ApplicationLayout({ children }: { children: ReactNode }) {
    return (
        <>
            {children}
            <SharedComponents />
        </>
    )
}

export default ApplicationLayout;