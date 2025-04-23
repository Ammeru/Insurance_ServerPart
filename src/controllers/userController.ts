import { Users } from '../database/models/Users';
import ApiError from "../error/apiError";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {NextFunction} from "express";

const generateJwt = (id: number, email: string, firstName: string) => {
    return jwt.sign(
         {id, email, firstName },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
    )
}

class UserController {
    async registration(req: Request, res: Response, next: NextFunction) {
        const { email, password, firstName, lastName } = req.body;
    }
}