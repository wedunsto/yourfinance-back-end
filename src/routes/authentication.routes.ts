import { Router } from "express";
import { register, login } from "../controllers/authentication.controller";

export const authenticationRouter = Router();

authenticationRouter.post("/user", register);
authenticationRouter.get("/user", login);
