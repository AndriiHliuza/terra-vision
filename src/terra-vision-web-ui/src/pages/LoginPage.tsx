import {useTranslation} from "react-i18next";
import {useMemo} from "react";
import {getLoginFormSchema, type LoginFormData} from "../configs/form-validation-schemas.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {axiosWebClient} from "../configs/axios-web-client.ts";

function LoginPage() {

    const { t } = useTranslation();

    const loginFormSchema = useMemo(() => getLoginFormSchema(t), [t]);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const onSubmit = async (data: LoginFormData) => {
        const response = await axiosWebClient.post("/api/auth/login", data)
        console.log(response)
    }

    return (
        <div>Login</div>
    )
}

export default LoginPage;