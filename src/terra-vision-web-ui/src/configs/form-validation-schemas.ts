import {z} from "zod";

export const getLoginFormSchema = (t: (key: string) => string) => z.object({
    email: z
        .email(t("login.errors.invalid-email")),
    password: z
        .string()
        .min(8, t("login.errors.invalid-password")),
})

export const getRegistrationFormSchema = (t: (key: string) => string) => z.object({
    username: z
        .string()
        .optional(),
    email: z
        .email(t("login.errors.invalid-email")),
    password: z
        .string()
        .min(8, t("login.errors.invalid-password")),
    confirmPassword: z
        .string()
        .min(8, t("login.errors.invalid-password")),
    firstname: z
        .string()
        .optional(),
    lastname: z
        .string()
        .optional(),
}).refine(data => data.password === data.confirmPassword, {
    message: t("login.errors.passwords-not-match"),
    path: ["confirmPassword"]
})

// ------------ Inferred Types ------------
export type LoginFormData = z.infer<ReturnType<typeof getLoginFormSchema>>;
export type RegistrationFormData = z.infer<ReturnType<typeof getRegistrationFormSchema>>;

// ------------ Backend payload type (confirmPassword excluded) ------------
export type UserCreationRequest = Omit<RegistrationFormData, "confirmPassword">;