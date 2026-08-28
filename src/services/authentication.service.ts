import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma.service";
import { RegisterResponseDto } from "../models/authentication.dto";

const SALT_ROUNDS = 10;

export class UsernameTakenError extends Error {
  constructor(username: string) {
    super(`Username "${username}" is already taken`);
    this.name = "UsernameTakenError";
  }
}

export async function registerUser(
  username: string,
  password: string
): Promise<RegisterResponseDto> {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await prisma.users.create({
      data: {
        id: randomUUID(),
        username,
        password: hashedPassword,
      },
    });

    return { username: user.username };
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new UsernameTakenError(username);
    }
    throw err;
  }
}
