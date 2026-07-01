const tenantMiddleware = (req,res,next)=>{
    if(req.user && req.user.tenant_id){
        req.tenantScope = {where : { tenant_id : req.user.tenant_id}}
    }
    next()
   
}
export default tenantMiddleware;