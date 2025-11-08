import '../styles/pages/NotFound.css'
import notFoundImg from "../assets/404_error_icon.svg";

function NotFound() {
    return (
        <main id="not-found-page">
            <img src={notFoundImg} alt="Not found img"/>
            <h1 className="not-found-h1">Not Found</h1>
        </main>
    )
}

export default NotFound;