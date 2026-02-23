db = db.getSiblingDB('terra-vision-ai-db');
db.createCollection('cv_models_collection');

const cvModelsData = {
    "mgt-yolo11-n": {
        "translations": {
            "en": {
                "displayName": "MGT YOLO11 n",
                "description": "The smallest and fastest model in the MGT YOLO11 series. Ideal for devices with limited resources or applications where speed is critical."
            },
            "ua": {
                "displayName": "MGT YOLO11 n",
                "description": "Найменша та найшвидша модель у серії MGT YOLO11. Ідеально підходить для пристроїв з обмеженими ресурсами або для застосунків, де швидкість є критичною."
            }
        }
    },
    "mgt-yolo11-s": {
        "translations": {
            "en": {
                "displayName": "MGT YOLO11 s",
                "description": "A compact model balancing speed and accuracy. Suitable for real-time where high performance is needed without significant loss of precision."
            },
            "ua": {
                "displayName": "MGT YOLO11 s",
                "description": "Компактна модель з балансом швидкості та точності. Підходить для реального часу, де потрібна висока продуктивність без суттєвої втрати точності."
            }
        }
    },
    "mgt-yolo11-m": {
        "translations": {
            "en": {
                "displayName": "MGT YOLO11 m",
                "description": "A medium model optimized for higher accuracy while maintaining acceptable speed. Perfect for tasks where reliability is important and processing moderate data volumes."
            },
            "ua": {
                "displayName": "MGT YOLO11 m",
                "description": "Середня модель, оптимізована для більшої точності при збереженні прийнятної швидкості. Ідеальна для задач, де важлива надійність результатів та стабільна обробка середніх обсягів даних."
            }
        }
    },
    "mgt-yolo11-l": {
        "translations": {
            "en": {
                "displayName": "MGT YOLO11 l",
                "description": "A large model with high object detection accuracy."
            },
            "ua": {
                "displayName": "MGT YOLO11 l",
                "description": "Велика модель з високою точністю розпізнання об’єктів."
            }
        }
    },
    "mgt-yolo11-x": {
        "translations": {
            "en": {
                "displayName": "MGT YOLO11 x",
                "description": "The largest and most accurate model in the MGT YOLO11 series."
            },
            "ua": {
                "displayName": "MGT YOLO11 x",
                "description": "Максимальна точність і деталізація розпізнання об’єктів"
            }
        }
    }
};

// Insert models into the collection
for (const cvModelId in cvModelsData) {
    const cvModel = cvModelsData[cvModelId];
    db.cv_models_collection.updateOne(
        { _id: cvModelId },   // filter by _id
        { $set: cvModel },    // set translations
        { upsert: true }      // insert if doesn't exist
    );
}