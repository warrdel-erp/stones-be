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

