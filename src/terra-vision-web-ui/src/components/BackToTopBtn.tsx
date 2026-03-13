import "../styles/components/BackToTopBtn.css";
import {useEffect, useState} from "react";
import backToTopImg from "../assets/back-to-top.png";


function BackToTopBtn({ scrollOffset = 1000 }: { scrollOffset?: number }) {

    const [visible, setVisible] = useState(false);

    const handleClick = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            setVisible(currentScroll > scrollOffset);
        };
        
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [scrollOffset]);

    return (
        <div
            className={`back-to-top-btn ${visible ? "" : "hide"}`}
            onClick={handleClick}
        >
            <img src={backToTopImg} alt="Back to Top" />
        </div>
    );
}

export default BackToTopBtn;