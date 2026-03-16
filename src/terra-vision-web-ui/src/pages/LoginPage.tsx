import "../styles/pages/AuthPage.css";
import {useTranslation} from "react-i18next";
import {useMemo, useState} from "react";
import {getLoginFormSchema, type LoginFormData} from "../configs/form-validation-schemas.ts";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Header from "../components/Header.tsx";
import {useAppContext} from "../configs/context/contexts.ts";
import axios from "axios";
import showPasswordImg from "../assets/eye-password-show.png";
import hidePasswordImg from "../assets/eye-password-hide.png";
import warningImg from "../assets/warning.png";
import {Link, useParams} from "react-router-dom";
import LoadingOverlay from "../components/LoadingOverlay.tsx";

function LoginPage() {

    const {t} = useTranslation();
    const {login} = useAppContext();
    const { lang } = useParams();

    const [showPassword, setShowPassword] = useState(false);

    const loginFormSchema = useMemo(() => getLoginFormSchema(t), [t]);

    const {
        register,
        handleSubmit,
        setError,
        formState: {errors, isSubmitting},
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginFormSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
        }
    })

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                if (status === 401) {
                    setError("root", {message: "login-page.errors.invalid-credentials"});
                } else {
                    setError("root", {message: "login-page.errors.server-error"});
                }
            }
        }
    }

    return (
        <div className="auth-page">
            <Header/>
            <div className="auth-form-card">
                <h1>{t("login-page.title")}</h1>
                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="form-card-item">
                        <label htmlFor="email">{t("login-page.labels.email")}<span>✱</span></label>
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
                        <label htmlFor="password">{t("login-page.labels.password")}<span>✱</span></label>
                        <div className="password-item-wrapper">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Must have at least 8 characters"
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
                    <Link
                        to={`/${lang}/renew`}
                        className="forgot-password-link"
                    >{t("login-page.forgot-password-message")}</Link>
                    {errors.root && (
                        <div className="root-error-section">
                            <hr className="form-divider" />
                            <div className="root-error-message-container">
                                <img src={warningImg} alt="Warning"/>
                                <div
                                    role="alert"
                                    className="root-error-message"
                                >{errors.root.message ? t(errors.root.message) : "ERROR"}</div>
                            </div>
                        </div>
                    )}
                    <button type="submit" disabled={isSubmitting}>{t("login-page.submit-btn")}</button>
                </form>
                <div className="auth-details">
                    {t("login-page.no-account")}{" "}
                    <Link to={`/${lang}/sign-up`}>{t("login-page.sign-up")}</Link>
                </div>
            </div>
            <LoadingOverlay visible={isSubmitting} />
        </div>
    )
}

export default LoginPage;