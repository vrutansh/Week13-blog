import z from "zod";

export const SignupInput = z.object({
  username: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
})