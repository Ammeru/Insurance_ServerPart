import { UserRole, ClientType } from '../database/models/Users';
import jwt from 'jsonwebtoken';

const generateJwt = (id: number, email: string, role: UserRole, clientType: ClientType) => {
    return jwt.sign(
        { id, email, role, clientType },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
    )
}

export { generateJwt };