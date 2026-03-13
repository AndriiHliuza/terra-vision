import "./App.css";
import {RouterProvider} from "react-router-dom";
import {router} from "./configs/routing/router.tsx";
import {ToastContainer} from "react-toastify";
import BackToTopBtn from "./components/BackToTopBtn.tsx";
import MouseTrail from "./components/graphics/MouseTrail.tsx";

function App() {
    return (
        <>
            {/* Routing settings */}
            <RouterProvider router={router}/>

            {/* Popup window settings */}
            <ToastContainer
                position="bottom-left"
                autoClose={5000}
                newestOnTop={true}
                closeOnClick={true}
                pauseOnHover={true}
                draggable={true}
                theme="colored"
            />

            {/* UI elements */}
            <BackToTopBtn />
            <MouseTrail />
        </>
    )
}

export default App;
