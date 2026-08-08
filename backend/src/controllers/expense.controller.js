import { Expense } from "../models/index.js";
import { Op } from "sequelize";

export const getAllExpenses = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {month , year} = req.query;
        const where = {tenant_id};

        if(category){
            where.category = category;
        }
        if(month && year){
            const startDate = `${year}-${String(month).padStart(2,'0')}-1`;
            const endDate = new Date(year,month,0).toISOString().split('T')[0];
            where.expense_date ={
                [Op.between]:[startDate,endDate]
            }
        }

        const expenses = await Expense.findAll({
            where,
            order:[['expense_date','DESC']]
        })

        const total = expenses.reduce((s,e)=> s+parseFloat(e.amount),0);
        return res.status(200).json({
            success:true,
            data:expenses,total
        })
    }
    catch(error){
        console.log("getAllExpenses",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }

}

export const createExpense = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {title,category,amount,expense_date,payment_method,note} = req.body;
        if(!title || !category || !expense_date){
            return res.status(400).json({
                success:false,
                message:"Please provide all required fields"
            })
        }

        const expense = await Expense.create({
            tenant_id,
            title,
            category : category || other,
            amount,
            expense_date,
            payment_method:payment_method || 'cash',
            note:note || null,
            added_by:req.user.user_id
        })

        return res.status(200).json({
            success:true,
            data:expense
        })
    }
    catch(error){
        console.log("createExpense error",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const updateExpense = async(req,res)=>{
    try{
    const tenant_id = req.user.tenant_id;
    const {id} = req.params;

    const expense = await Expense.findOne({
        where:{
            id,tenant_id
        }
    })

    if(!expense){
        return res.status(404).json({
            success:false,
            message:"Expense not found"
        })
    }

    const {title , category , amount , expense_date , payment_method, note }= req.body;

    await expense.update({
        ...(title !== undefined && {title}),
        ...(category !== undefined && {category}),
        ...(amount !== undefined && {amount}),
        ...(expense_date !== undefined && {expense_date}),
        ...(payment_method !== undefined && {payment_method}),
        ...(note !== undefined && {note})
    })

    return res.status(200).json({
        success:true,
        message:"Expense updated successfully"
    })
    }
    catch(error){
        console.log("updateExpense error",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const deleteExpense = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;

        const expense = await Expense.findOne({
            where:{
                id,
                tenant_id,
                // is_active:true
            }
        })

        if(!expense){
            return res.status(404).json({
                success:false,
                message:"Expense not found"
            })
        }

        await expense.destroy()

        return res.status(200).json({
            success:true,
            message:"Expense deleted successfully"
        })
    }
    catch(error){
        console.log("deleteExpense error",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const getExpenseSummmary = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {month,year} = req.query;

        const startDate = `${year}-${String(month).padStart(2,'0')}-01`
        const endDate = new Date(year,month,0).toISOString().split('T')[0]

        const expense = await Expense.findAll({
            where:{
                tenant_id,
                is_active:true,
                date:{
                    [Op.between]:[startDate,endDate]
                }
            }
        })

        const summary = {}

        for(const exp of expense){
            if(!summary[exp.category]){
                summary[exp.category]=0
            }

            summary[exp.category]+=exp.amount
        }

        const total = Object.values(summary).reduce((s,v)=>s+v,0
    )
    return res.status(200).json({
        success:true,
        message:"Expense Summary fetched successfully",
        data:{
            summary,
            total
        }
    })
    }catch(err){
        console.log(err)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
    })
        }
    }
