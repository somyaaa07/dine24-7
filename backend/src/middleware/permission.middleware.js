export const checkPermission = (permission) => {
    return (req, res, next) => {
        const { permissions, role } = req.user;

        // owner has full access
        if (role === 'owner' || permissions.all === true) {
            return next();
        }

        // manager has extra access for settings
        if (permission === 'manage_settings' && role === 'manager') {
            return next();
        }

        // permission check
        if (!permissions[permission]) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to perform this action'
            });
        }

        next();
    };
};