import { Router } from "express";
import {
    login,
    register, 
    checkUsernameExists
} from "../controllers/authentication.controller";

export const authenticationRouter = Router();

authenticationRouter.get("/userExists", checkUsernameExists);
authenticationRouter.post("/register", register);
authenticationRouter.post("/login", login);