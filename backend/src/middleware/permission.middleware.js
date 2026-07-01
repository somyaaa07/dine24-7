const checkPermission = (permission) =>{
    return (req,res,next)=>{
        const { permissions , role} = req.user;

        // owner

      if(role === 'owner' || permission.all === true){
        return next();
      }

      // permission check 
      if(!permissions[permission]){
        return res.status(403).json({
            sucess:false,
          message: 'You are not authorized to perform this action'
        })
      }

      next();
    }
}

export default checkPermission;