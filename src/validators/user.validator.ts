import * as z from "zod";
import { authValidator } from ".";

export const updateProfile = authValidator.adminSignUpSchema.partial().extend({
  password: z
    .string({
      message: "Password must be a string",
    })
    .min(1, {
      message: "Password field is required.",
    }),
});

export const updateFlags = z.object({
  isSuspended: z.coerce.boolean({
    message: "isSuspended must be a boolean.",
  }),
});
