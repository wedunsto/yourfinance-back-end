import { Router } from "express";
import { login, register } from "../controllers/authentication.controller";

export const authenticationRouter = Router();

authenticationRouter.post("/register", register);
authenticationRouter.post("/login", login);