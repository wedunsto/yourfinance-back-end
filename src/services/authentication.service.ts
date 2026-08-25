import bcrypt from "bcrypt";
import { RegisterResponseDto } from "../models/authentication.dto";

const SALT_ROUNDS = 10;

export async function registerUser(
  username: string,
  password: string
): Promise<RegisterResponseDto> {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  return { username };
}
