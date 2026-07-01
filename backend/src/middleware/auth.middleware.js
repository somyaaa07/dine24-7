import jwt from 'jsonwebtoken';

const authMiddleware = (req,res,next)=>{
    try{
        const authHeader = req.headers.authorization; 

        if(!authHeader || !authHeader.startswith('Bearer')){
            return res.status(401).json({
                success:false,
                message:'Please do Login first'
            })
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        req.user = {
            id:decoded.user.id,
            tenant_id:decoded.tenant.id,
            role:decoded.role,
            permission:decoded.permissions
        };
        next();


    }
    catch(error){
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({
                success:false,
                message:'Token Expire . please do Login again',
                code:"TOKEN_EXPIRED"
            })
        }
    }

    return res.status(401).json({
        success:false,
        message:'Invalid Token Please do Login first'
    })
};

export default authMiddleware;