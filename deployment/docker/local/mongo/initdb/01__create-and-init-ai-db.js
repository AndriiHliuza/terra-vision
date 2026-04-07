db = db.getSiblingDB("terra-vision-ai-db");
db.createCollection("models");
db.createCollection("stats");

const models = [
    {
        _id: "mgt-yolo11-n",
        name: "MGT YOLO11 n",
        description: {
            en: "The smallest and fastest model in the MGT YOLO11 series. Ideal for devices with limited resources or applications where speed is critical.",
            uk: "Найменша та найшвидша модель у серії MGT YOLO11. Ідеально підходить для пристроїв з обмеженими ресурсами або для застосунків, де швидкість є критичною."
        }
    },
    {
        _id: "mgt-yolo11-s",
        name: "MGT YOLO11 s",
        description: {
            en: "A compact model balancing speed and accuracy. Suitable for real-time applications where high performance is needed without significant loss of precision.",
            uk: "Компактна модель з балансом швидкості та точності. Підходить для реального часу, де потрібна висока продуктивність без суттєвої втрати точності."
        }
    },
    {
        _id: "mgt-yolo11-m",
        name: "MGT YOLO11 m",
        description: {
            en: "A medium model optimized for higher accuracy while maintaining acceptable speed. Perfect for tasks where reliability is important and processing moderate data volumes.",
            uk: "Середня модель, оптимізована для більшої точності при збереженні прийнятної швидкості. Ідеальна для задач, де важлива надійність результатів та стабільна обробка середніх обсягів даних."
        }
    },
    {
        _id: "mgt-yolo11-l",
        name: "MGT YOLO11 l",
        description: {
            en: "A large model with high object detection accuracy.",
            uk: "Велика модель з високою точністю розпізнання об'єктів."
        }
    },
    {
        _id: "mgt-yolo11-x",
        name: "MGT YOLO11 x",
        description: {
            en: "The largest and most accurate model in the MGT YOLO11 series.",
            uk: "Максимальна точність і деталізація розпізнання об'єктів."
        }
    }
];

for (const model of models) {
    db.models.updateOne(
        { _id: model._id },
        { $set: model },
        { upsert: true }
    );
}