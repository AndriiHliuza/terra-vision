import "../styles/pages/AuthPage.css";
import {useTranslation} from "react-i18next";
import {useMemo, useState} from "react";
import {
    getRegistrationFormSchema,
    type RegistrationFormData
} from "../configs/form-validation-schemas.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Header from "../components/Header.tsx";
import axios from "axios";
import showPasswordImg from "../assets/eye-password-show.png";
import hidePasswordImg from "../assets/eye-password-hide.png";
import {Link, useParams} from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay.tsx";
import {axiosWebClient} from "../configs/axios-web-client.ts";

function RegistrationPage() {

    const {t} = useTranslation();
    const { lang } = useParams();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const registrationFormSchema = useMemo(() => getRegistrationFormSchema(t), [t]);

    const {
        register,
        handleSubmit,
        setError,
        formState: {errors, isSubmitting},
    } = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationFormSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
            username: "",
            firstname: "",
            lastname: "",
            password: "",
            confirmPassword: ""
        }
    })

    const onSubmit = async (data: RegistrationFormData) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword, ...payload } = data;
            await axiosWebClient.post("/api/users", payload);
            console.log("Check your email")
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 409) {
                    setError("root", {message: "login-page.errors.account-already-exists"});
                } else {
                    setError("root", {message: "login-page.errors.server-error"});
                }
            }
        }
    }

    return (
        <div className="auth-page registration-page">
            <Header/>
            <div className="auth-form-card">
                <h1>{t("registration-page.title")}</h1>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="form-card-item">
                        <label htmlFor="email">{t("registration-page.labels.email")}</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            {...register("email")}
                        />
                        {errors.email && <p
                            role="alert"
                            className="error-message"
                        >{errors.email.message}</p>}
                    </div>
                    <div className="form-card-item">
                        <label htmlFor="username">{t("registration-page.labels.username")}</label>
                        <input
                            id="username"
                            placeholder="JohnSmith"
                            {...register("username")}
                        />
                        {errors.username && <p
                            role="alert"
                            className="error-message"
                        >{errors.username.message}</p>}
                    </div>
                    <div className="form-card-item">
                        <label htmlFor="firstname">{t("registration-page.labels.firstname")}</label>
                        <input
                            id="firstname"
                            placeholder="John"
                            {...register("firstname")}
                        />
                        {errors.firstname && <p
                            role="alert"
                            className="error-message"
                        >{errors.firstname.message}</p>}
                    </div>
                    <div className="form-card-item">
                        <label htmlFor="lastname">{t("registration-page.labels.lastname")}</label>
                        <input
                            id="lastname"
                            placeholder="Smith"
                            {...register("lastname")}
                        />
                        {errors.lastname && <p
                            role="alert"
                            className="error-message"
                        >{errors.lastname.message}</p>}
                    </div>
                    <div className="form-card-item">
                        <label htmlFor="password">{t("registration-page.labels.password")}</label>
                        <div className="password-item-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="qwerty12345"
                                {...register("password")}
                            />
                            <div className="show-hide-password-img-wrapper">
                                <img
                                    onClick={() => setShowPassword(prev => !prev)}
                                    src={showPassword ? hidePasswordImg : showPasswordImg}
                                    alt={showPassword ? "Hide password" : "Show password"}
                                />
                            </div>
                        </div>
                        {errors.password && <p
                            role="alert"
                            className="error-message"
                        >{errors.password.message}</p>}
                    </div>
                    <div className="form-card-item">
                        <label htmlFor="confirmPassword">{t("registration-page.labels.confirmPassword")}</label>
                        <div className="password-item-wrapper">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="qwerty12345"
                                {...register("confirmPassword")}
                            />
                            <div className="show-hide-password-img-wrapper">
                                <img
                                    onClick={() => setShowConfirmPassword(prev => !prev)}
                                    src={showConfirmPassword ? hidePasswordImg : showPasswordImg}
                                    alt={showConfirmPassword ? "Hide password" : "Show password"}
                                />
                            </div>
                        </div>
                        {errors.confirmPassword && <p
                            role="alert"
                            className="error-message"
                        >{errors.confirmPassword.message}</p>}
                    </div>
                    {errors.root && (
                        <div className="root-error-section">
                            <hr className="form-divider" />
                            <div
                                role="alert"
                                className="root-error-message"
                            >{errors.root.message ? t(errors.root.message) : "ERROR"}</div>
                        </div>
                    )}
                    <button type="submit" disabled={isSubmitting}>{t("registration-page.submit-btn")}</button>
                </form>
                <div className="auth-details">
                    {t("registration-page.no-account")}{" "}
                    <Link to={`/${lang}/login`}>{t("registration-page.login")}</Link>
                </div>
            </div>
            <LoadingOverlay visible={isSubmitting} />
        </div>
    )
}

export default RegistrationPage;