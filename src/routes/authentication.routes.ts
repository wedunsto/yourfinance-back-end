import { Router } from "express";
import { register } from "../controllers/authentication.controller";

export const authenticationRouter = Router();

authenticationRouter.post("/user", register);
