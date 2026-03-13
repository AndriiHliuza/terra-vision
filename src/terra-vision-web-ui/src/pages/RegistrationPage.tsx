import {
    getRegistrationFormSchema,
    type RegistrationFormData
} from "../configs/form-validation-schemas.ts";
import {useMemo} from "react";
import {useTranslation} from "react-i18next";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {axiosWebClient} from "../configs/axios-web-client.ts";

function RegistrationPage() {

    const { t } = useTranslation();

    const registrationFormSchema = useMemo(() => getRegistrationFormSchema(t), [t]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationFormSchema),
        defaultValues: {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            firstname: "",
            lastname: "",
        },
    });

    const onSubmit = async (data: RegistrationFormData) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { confirmPassword, ...payload } = data;
        const response = await axiosWebClient.post("/api/auth/registration", payload);
        console.log(response);
    };

    return (
        <div>Register</div>
    )
}

export default RegistrationPage;