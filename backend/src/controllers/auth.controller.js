import bcrypt from 'bcrypt';
import { v4 as UUIDV4} from 'uuid'
import {sequlize , Tenant , User , Role , AuditLog , RefreshToken } from '../models/index.js'
import { sendWelcomeEmail } from '../utils/email.utils.js'
import jwt from 'jsonwebtoken';

export const register = async(req,res)=>{
    const { resturant_name, owner_name, phone , password , email } = req.body;

    if(!email || !password || !resturant_name ){
      return  res.status(400).json({
            success:false,
            message:"Resturant Name , email , password is mendatory"
        })
    }
    if(password.length < 8){
        return res.status().json({
            success:false,
            message:"Password must be greater then 8 letters"
        })
    }
    const transaction = await sequlize.transaction()
    
    try{

        //now genrating subdomain
        let subdomain = resturant_name
        .toLowerCase()
        .replace(/[^a-z0-9]/g , "-")
        .replace(/-+/g,"-");

        const existingTenant = await Tenant.findOne(
            {
                where:{subdomain},
                transaction,
            }
        ),

        // checking if the existing sub domain present by timestamp as millisecond
        if(existingTenant){
            subdomain = `${subdomain}-${Date.now()}`
        }

        // now create tenant 
        const Tenant = await Tenant.create(
            {
                id: UUIDV4(),
                name:resturant_name,
                subdomain,
                plan:'starter',
                status:'trial',
                trial_ends_at:new Date (
                    Date.now() + 14 * 24 * 60 *60 *1000
                )
            },
            {
                transaction
            }
        )

        // now we're hashing the password we can hash password in any time
        const password_hash = await bcrypt.hash(password , 12);

        // creating the default roles
        const roles = await Role.bulkCreate(
           [
            {
                name:"owner",
                tenant_id:tenant.id,
                permissions:JSON.stringify(
                    {
                        all:true
                    }
                ),
            },
            {
                name:"manager",
                tenant_id:tenant.id,
                permissions:JSON.stringify({
                    order:true,
                    inventory:true,
                    reports:true,
                    staff:true,
                    menu:true,
                    tables:true
                }),
            },
            {
                name:"waiter",
                tenant_id:tenant.id,
                permissions:JSON.stringify(
                 {
                       order:true,
                       tables:true,
                       menu:["read"]
                 }

                ),
            },

            {
                name:"chef",
                tenant_id:tenant.id,
                permissions:JSON.stringify({
                    kitchen:true,
                    menu:["read"]
                }),
            },

           ],
           {transaction}
        );

        // finding the owner role
        const ownerRole = roles.find((role)=>role.name==="owner")

        // creating the owner

        const user = await User.create(
            {
                id:UUIDV4(),
                tenant_id:tenant.id,
                name:owner_name,
                email,
                password_hash,
                role_id:ownerRole.id,
                is_active:true
            },
            {
                transaction
            }
            
        );

        // creating this for having the records of any 
        await AuditLog.create(
            {
                tenant_id:tenant.id,
                user_id:user.id,
                action:"TENANT REGISTER",
                ip_address:req.ip
            },
            {transaction}
        ),

        await transaction.commit();

        // sending the welcome email
        sendWelcomeEmail({
            to:email,
            name:owner_name,
            resturant:resturant_name,
            subdomain:`${subdomain}.debox.com`
        }).catch((err)=>console.error("Email Failed", err))

       
        return res.status(200).json({
            success:true,
            message:"Resturnant registered successfully",
            data:{
                tenant_id:tenant.id,
                subdomain:`${subdomain}.deox.com`
            }
        })
    }
    catch(err){
        await transaction.rollback();
        console.error("Error in register tenant", err);
        return res.status(500).json({
            success:false,
            message:"register tenant failed"
        })

    }


}

export const login = async(req,res)=>{
    const {email,password, tenant_id} = req.body;

    //find the user first
    try{
        const user = await User.findOne({
            where:{
                email,
                tenant_id,
                is_active:true
            },
           include:[
            {
                model:Role,
            }
           ]
        });

    // if did'nt find the user
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }

        // verify the password
        const isPasswordValid = await bcrypt.compare(password,user.password);

        // if password is not valid
        if(!isPasswordValid){
            return res.status(401).json({
                success:false,
                messgae:"the password is not valid or incorrect"
            });
        }

        // we will find out if the tenant is active or not 
        const tenant = await Tenant.findByPk(tenant_id);

        if(tenant.status === 'suspended'){
            return res.status(403).json({
                success:false,
                message:"Tenant is got suspended ! kindly renew it to continue"
            });
        }

        const accessToken = jwt.sign(
            {
                user_id:user.id,
                tenant_id:user.tenant_id,
                role:user.Role.name,
                permissions:user.Role.permissions
            },
            process.env.JWT_SECRET,
            {
                expiresIn:"15m"
            }
        );

        const refreshToken = jwt.sign(
            {
                user_id:user.id,
                tenant_id:user.tenant_id,

            },
            process.env.JWT_REFRESH_SECRET,
            {
                expiresIn:"7d"
            }
        );

        // saving the refresh token
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

        await RefreshToken.create({
            user_id:user.id,
            token:refreshTokenHash,
            expires_at : new Date(Date.now() + 7*24*60*60*1000),
            ip_address:req.ip
        });

        //last login Update
        await user.update({
            last_login_at:new Date(),
        });

        //creating audit log 

        await AuditLog.create({
            tenant_id:user.tenant_id,
            user_id:user.id,
            action:"Login",
            ip_address:req.ip,
        });

        return res.status(200).json({
            sucess:true,
            data:{
               access_token:accessToken,
               refresh_token:refreshToken,
               user:{
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role.name,
                permissions:user.role.permissions,
               }
            }
           
        })

    }
    catch(error){
        console.log("login failed :",error);

        return res.status(500).json({
            success:false,
            message:"server error"
        })
    }
}


export const logout = async(req,res)=>{
    const { refreshToken } = req.body
    
    if(!refreshToken){
        return res.status(400).json({
            sucess:false,
            message:"refresh token is required"
        })
    };

    try{
        const userId = req.user.user_id;

        // from this we have all the token which are related to the user id 
        const tokens = await RefreshToken.findAll({
            where:{ user_id:userId}
        })

        let matchedToken = null ;
        for(const t of tokens) {
            const isMatch = await bcrypt.compare(refreshToken , t.token);
            if(isMatch){
                matchedToken = t;
                break;
            }

        }

        if(!matchedToken){
            return res.status(400).json({
                success:false,
                message:"token not found or log out already"
            })
        }

        await matchedToken.destroy();

        // audit log
        await AuditLog.create({
            tenant_id:req.user.tenant_id,
            user_id:userId,
            action:"Logout",
            ip_address:req.ip,

        })

        return res.status(200).json({
            success:true,
            message:"Logout successfully"
        })
    }
    catch(error){
        console.log("logout failed",error);
        return res.status(500).json({
            status:false,
            message:"Server Error"
        })
    }
}

export const refreshToken = async(req,res)=>{
    const { refresh_Token } = req.body;

    if(!refresh_Token){
        return res.status(400).json({
            success:false,
            message:"Refresh Token is expired"
        })
    }

    try{
        let decoded ;
        try{
            decoded = jwt.verify(refresh_Token,process.env.REFRESH_TOKEN_SECRET);    
        }catch(err){
            return res.status(400).json({
                success:false,
                message:"Refresh Token is expired"
            });
        }
            const tokens = await TokenExpiredError.findAll({where:{user_id:decoded.user_id}})
            let matchedToken = null ;
            for (const t of tokens ) {
                const isMatch = await bcrypt.compare(refresh_Token,t.token);
                if(isMatch){
                    matchedToken=t;
                    break;
                }

            }

            if(!matchedToken){
                return res.status(400).json({
                    success:false,
                    message:"Refresh Token is expried Please Login again"
                })
            }

            if(new Date() > matchedToken.expires_at){
                await matchedToken.destroy();
                return res.status(400).json({
                    success:false,
                    message:"Refresh Token is expries please do login in again"
                })
            }


            // generate new access token 
            const user = await User.findOne({where:{id:decoded.user_id , is_active:true},include:[{model:Role}]})

            if(!user){
                return res.status(400).json({
                    success:false,
                    message:"User not found"
                })
            }

            const newAccessToken = jwt.sign({
                user_id:user.id,
                role:user.role.name,
                tenant_id:user.tenant_id,
                permissions:user.role.permissions
            },
        process.env.JWT_SECRET,
    {expiresIn:"15m"});

    return res.status(200).json({
        success:true,
        data:{
            access_token:newAccessToken,
        }
    })

    }
    catch(error){
        console.log("refreshe token failed",error)
        return res.status(500).json({
            success:false,
            message:"Server Error"
        })
    }

}

export const getMe = async(req,res)=>{
    try{
        const userId = req.user.user_id;

        const user = await User.findOne({where:{id:userId,is_active:true},include:[{model:Role}],attributes:{exclude:["password_hash"]}});

        if(!user){
            return res.status(400).json({
                success:false,
                message:"user not found"
            })
        }

        return res.status(200).json({
            success:true,
            data:{
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.Role.name,
                tenant_id:user.tenant_id,
                permissions:user.Role.permissions,
                last_login_at:user.last_login_at
            }
        })

    }
    catch(error){
        console.log("get me failed",error)
        return res.status(500).json({
            success:false,
            message:"Server Error"
        })
    }
}