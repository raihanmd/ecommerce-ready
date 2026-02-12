import { z } from "zod";

export class UsersValidation {
  static LOGIN = z.object({
    username: z.string(),
    password: z.string(),
  });

  //   static RESGISTER = z.object({
  //     username: z.string(),
  //     password: z.string().min(8),
  //     school_name: z.string().min(3).max(50),
  //   });
}

// export type AuthRegisterPayload = z.infer<typeof UsersValidation.RESGISTER>;
export type AuthLoginPayload = z.infer<typeof UsersValidation.LOGIN>;
