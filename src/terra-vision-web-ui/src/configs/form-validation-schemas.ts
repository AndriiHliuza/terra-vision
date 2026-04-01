import {z} from "zod";

export const getLoginFormSchema = (t: (key: string) => string) => z.object({
    email: z
        .email(t("forms.login-form.errors.invalid-email")),
    password: z
        .string()
        .min(8, t("forms.login-form.errors.invalid-password")),
})

export const getRegistrationFormSchema = (t: (key: string) => string) => z.object({
    username: z
        .string()
        .optional(),
    email: z
        .email(t("forms.create-user-form.errors.invalid-email")),
    password: z
        .string()
        .min(8, t("forms.create-user-form.errors.invalid-password")),
    confirmPassword: z
        .string()
        .min(8, t("forms.create-user-form.errors.invalid-password")),
    firstname: z
        .string()
        .optional(),
    lastname: z
        .string()
        .optional(),
}).refine(data => data.password === data.confirmPassword, {
    message: t("forms.create-user-form.errors.passwords-not-match"),
    path: ["confirmPassword"]
})

// ------------ Inferred Types ------------
export type LoginFormData = z.infer<ReturnType<typeof getLoginFormSchema>>;
export type RegistrationFormData = z.infer<ReturnType<typeof getRegistrationFormSchema>>;
