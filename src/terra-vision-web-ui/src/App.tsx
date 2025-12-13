import "./App.css";
import RoutingConfig from "./configs/RoutingConfig.tsx";
import ApplicationContextProvider from "./configs/contexts/ApplicationContextProvider.tsx";

function App() {
    return (
        <ApplicationContextProvider>
            <RoutingConfig/>
        </ApplicationContextProvider>
    )
}

export default App;
