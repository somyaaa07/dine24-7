import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer')) {
            return res.status(401).json({
                success: false,
                message: 'Please do Login first'
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            user_id: decoded.user_id,
            tenant_id: decoded.tenant_id,
            role: decoded.role,
            permissions: decoded.permissions
        };

        return next(); // yahan return zaroori hai, warna niche ka code bhi chal jayega

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token Expire . please do Login again',
                code: "TOKEN_EXPIRED"
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid Token Please do Login first'
        });
    }
};

export default authMiddleware;