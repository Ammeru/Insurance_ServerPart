import { UserRole } from '../database/models/Users';
import jwt from 'jsonwebtoken';

const generateJwt = (id: number, email: string, role: UserRole) => {
    return jwt.sign(
        { id, email, role },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
    )
}

export { generateJwt };