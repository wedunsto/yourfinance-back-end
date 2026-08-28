import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import jwt, { SignOptions } from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { prisma } from "./prisma.service";
import { LoginResponseDto, RegisterResponseDto } from "../models/authentication.dto";

const SALT_ROUNDS = 10;

export class UsernameTakenError extends Error {
  constructor(username: string) {
    super(`Username "${username}" is already taken`);
    this.name = "UsernameTakenError";
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid username or password");
    this.name = "InvalidCredentialsError";
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

export async function loginUser(
  username: string,
  password: string
): Promise<LoginResponseDto> {
  const user = await prisma.users.findUnique({ where: { username } });

  if (!user) {
    throw new InvalidCredentialsError();
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new InvalidCredentialsError();
  }

  const jsonwebtoken = jwt.sign(
    { sub: user.id, username: user.username },
    process.env["JWT_SECRET"] as string,
    { expiresIn: process.env["JWT_EXPIRES"] as SignOptions["expiresIn"] }
  );

  return { jsonwebtoken };
}
