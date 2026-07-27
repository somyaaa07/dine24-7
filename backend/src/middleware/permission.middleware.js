export const checkPermission = (permission) => {
    return (req, res, next) => {
        const { permissions, role } = req.user;

        // Owner sab kar sakta hai
        if (role === 'owner' || permissions?.all === true) {
            return next();
        }

        // Manager bhi sab kar sakta hai
        if (role === 'manager') {
            return next();
        }

        // Waiter sirf order aur tables
        if (role === 'waiter' && ['order', 'tables'].includes(permission)) {
            return next();
        }

        // Chef sirf kitchen
        if (role === 'chef' && permission === 'kitchen') {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Aapko ye karne ki permission nahi hai'
        });
    };
};