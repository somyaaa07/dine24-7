import {Branch , Tenant} from '../models/index.js';
import {PLANS} from '../config/plan.js';

export const getAllBranches = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
         const branches = await Branch.findAll({
            where: { tenant_id },
            order: [['is_main', 'DESC'], ['createdAt', 'ASC']]
        });
                return res.status(200).json({ success: true, data: branches });
    }
    catch (error) {
        console.log("getAllBranches failed", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const createBranch = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {name,address,phone} = req.body;

        if(!name){
            return res.status(400).json({success:false,message:"Name is required"})
        }
         const tenant = await Tenant.findByPk(tenant_id);
          if (!tenant) {
            return res.status(404).json({ success: false, message: "Tenant not found" });
        }
        const planLimit = PLANS[tenant.plan]?.max_branches ?? 1;
        const existingCount = await Branch.count({ where: { tenant_id } });

          if (planLimit !== -1 && existingCount >= planLimit) {
            return res.status(403).json({
                success: false,
                code: 'BRANCH_LIMIT_REACHED',
                message: `Aapke ${tenant.plan} plan me sirf ${planLimit} branch allowed hai. Plan upgrade karo.`
            });
        }

             const branch = await Branch.create({
            tenant_id,
            name,
            address,
            phone,
            is_main: existingCount === 0
        });

        return res.status(201).json({ success: true, data: branch });



    }
    catch (error) {
        console.log("createBranch failed", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export const updateBranch = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;
        const { name, address, phone, is_active } = req.body;

        const branch = await Branch.findOne({ where: { id, tenant_id } });
        if (!branch) {
            return res.status(404).json({ success: false, message: "Branch not found" });
        }

        if (name !== undefined) branch.name = name;
        if (address !== undefined) branch.address = address;
        if (phone !== undefined) branch.phone = phone;
        if (is_active !== undefined) branch.is_active = is_active;

        await branch.save();
        return res.status(200).json({ success: true, data: branch });
    } catch (error) {
        console.log("updateBranch failed", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const deleteBranch = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;

        const branch = await Branch.findOne({ where: { id, tenant_id } });
        if (!branch) {
            return res.status(404).json({ success: false, message: "Branch not found" });
        }

        if (branch.is_main) {
            return res.status(400).json({ success: false, message: "Main branch ko delete nahi kar sakte" });
        }

        await branch.destroy();
        return res.status(200).json({ success: true, message: "Branch deleted" });
    } catch (error) {
        console.log("deleteBranch failed", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};