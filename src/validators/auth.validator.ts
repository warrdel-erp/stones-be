import { z } from "zod";

export const changePasswordSchema = z.object({
    oldPassword: z.string({
        required_error: "Old password is required",
        invalid_type_error: "Old password must be a string",
    }).min(1, "Old password is required"),
    newPassword: z.string({
        required_error: "New password is required",
        invalid_type_error: "New password must be a string",
    }).min(6, "New password must be at least 6 characters long"),
}).refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from old password",
    path: ["newPassword"],
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const deleteClientAccountSchema = z.object({
    email: z.string({
        required_error: "Email is required",
        invalid_type_error: "Email must be a string",
    }).email("Please provide a valid email address"),
    password: z.string({
        required_error: "Password is required",
        invalid_type_error: "Password must be a string",
    }).min(1, "Password is required"),
});

export type DeleteClientAccountInput = z.infer<typeof deleteClientAccountSchema>;
