import "../../styles/components/detector-page/ModelSelector.css";
import {Dropdown} from "../Dropdown.tsx";
import type {ModelDetails} from "../../commons/dto/detector-dtos.ts";
import {useTranslation} from "react-i18next";

interface ModelSelectorProps {
    models: ModelDetails[];
    selectedModel: ModelDetails | null | undefined;
    onSelect: (model: ModelDetails) => void;
}

function ModelSelector({models, selectedModel, onSelect}: ModelSelectorProps) {

    const {t} = useTranslation();

    return (
        <div className="models-section">
            <div className="models-dropdown-container">
                <Dropdown
                    label={selectedModel?.name ? selectedModel.name : t("detector-page.models-dropdown-title")}
                    items={models.map(model => ({id: model.id, name: model.name}))}
                    onSelect={model => onSelect(models.find(m => m.id === model.id)!)}
                />
            </div>
            <div className="model-description">
                {models.find(model => model.id === selectedModel?.id)?.description
                    ?? t("detector-page.model-description-default-text")}
            </div>
        </div>
    )
}

export default ModelSelector;