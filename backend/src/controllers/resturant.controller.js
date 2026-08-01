import { ResturantProfile , AuditLog } from "../models/index.js";

export const getProfile = async (req, res) => {
    try{
        const tenant_id = req.user.tenant_id;
        let profile = await ResturantProfile.findOne({where:{tenant_id}});

        if(!profile){
            profile = await ResturantProfile.create({
                tenant_id,
                resturant_name:'My Resturant'
            });
        }

        return res.status(200).json({
            success:true,
            data:profile
        })
    }
    catch(error){
        console.log("getProfile failed", error)
        return res.status(500).json(
            {
                success:false,
                message:'server error'
            }
        )
    }
}

export const updateProfile = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {
            resturant_name,
            email,
            phone,
            address, 
            city,
            pincode,
            gstin,
            tax_percentage,
            tax_inclusive,
            currency,
            currency_symbol,
            working_hours,
            receipt_header,
            receipt_footer,
            show_logo_on_receipt
        }= req.body

        if(resturant_name && resturant_name.trim() === ''){
            return res.status(400).json({
                success:false,
                message:'the resturant name can not be empty'
            })
        };

        if(tax_percentage !== undefined && (tax_percentage < 0 || tax_percentage > 100)){
            return res.status(400).json({
                success:false,
                message:'tax percentage will be between 0 and 100 '
            })
        };
        

        if(gstin && gstin.length !==15){
            return res.status(400).json({
                success:false,
                message:"GSTIN must be have the 15 charracter"
            })
        };

        let profile = await ResturantProfile.findOne({where:{tenant_id}})
        if(!profile){
            profile = await ResturantProfile.create({tenant_id,resturant_name:'My Resturant'})
        }

        await profile.update({
            ...(resturant_name && {resturant_name}),
            ...(email && {email}),
            ...(phone && {phone}),
            ...(address && {address}),
            ...(city && {city}),
            ...(pincode && {pincode}),
            ...(gstin && {gstin}),
            ...(tax_percentage !==undefined && {tax_percentage}),
            ...(tax_inclusive !==undefined && {tax_inclusive}),
            ...(currency && {currency}),
            ...(currency_symbol && {currency_symbol}),
            ...(working_hours && {working_hours}),
            ...(receipt_header !==undefined && {receipt_header}),
            ...(receipt_footer !==undefined && {receipt_footer}),
            ...(show_logo_on_receipt !==undefined && {show_logo_on_receipt})

        });

        await AuditLog.create({
            tenant_id,
            user_id:req.user.user_id,
            action:'PROFILE_UPDATE',
            ip_address:req.ip

        });

        return res.status(200).json({
            success:true,
            message:'profile has been updated',
            data:profile
        })
    }
    catch(error){
        console.log('Profile update is failed', error);
        return res.status(500).json({
            success:false,
            message:'server error'
        })
    }
};

export const updateLogo = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {logo_url} = req.body;

        if(!logo_url){
            return res.status(400).json({
                success:false,
                message:'Logo URL is required'
            })
        }

        let profile = await ResturantProfile.findOne({where:{tenant_id}})

        if(!profile){
            return res.status(404).json({
                success:false,
                message:'Did not find any profile'
            })
        }

        await profile.update({logo_url})


        return res.status(200).json({
            success:true,
            message:'logo image has been changed'
        })
    }
    catch(error){
        console.log("logo update is failed",error)
        return res.status(500).json({
            success:false,
            message:'server error'
        })

    }
}