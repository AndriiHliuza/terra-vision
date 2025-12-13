import "../styles/components/PopUp.css";

interface PopUpProps {
    title: string;
    description: string;
}

function PopUp({ title, description }: PopUpProps) {

    return (
        <div className="pop-up">
            <h4>{title}</h4>
            <div>{description}</div>
        </div>
    );
}

export default PopUp;