import "./App.css";
import Routing from "./configs/Routing.tsx";
import ApplicationContextProvider from "./configs/context/ApplicationContextProvider.tsx";
import {BrowserRouter} from "react-router-dom";
import GlobalComponents from "./components/GlobalComponents.tsx";

function App() {
    return (
        <ApplicationContextProvider>
            <BrowserRouter>
                <Routing/>
                <GlobalComponents/>
            </BrowserRouter>
        </ApplicationContextProvider>
    )
}

export default App;
