import { JwtPayload } from "../../src/middleware/auth";

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export {};