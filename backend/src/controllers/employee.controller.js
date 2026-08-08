import {Employee,Attendance,Payroll} from '../models/index.js';
import {Op} from 'sequelize';


export const getAllEmployee = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const employee = await Employee.findAll({
            where:{
                tenant_id,is_active:true
            },
            order:[['name','ASC']]
        })

        return res.status(200).json({
            success:true,
            message:'Employee fetched successfully',
            data:employee})
    }
    catch(err){
        console.log("getAllEmployee error",err);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const getEmployeeById = async(req,res)=>{
    try{
        const {id} = req.params;
        const tenant_id = req.user.tenant_id;
        const employee = await Employee.findOne({
            where:{
                id,tenant_id,is_active:true
            }
        })
        if(!employee){
            return res.status(404).json({
                success:false,
                message:"Employee not found"
            })
        }

        const recentAttendance = await Attendance.findOne({
            where:{
                tenant_id,
                employee_id:id,
                is_active:true
            },
            order:[['date','DESC']] , limit:30
        });

        return res.status(200).json({
            success:true,
            data:{...employee.toJSON(),recentAttendance}
        })
    }
    catch(error){
        console.log("getEmployeeById error",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const createEmployee = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {name,email,phone,address,role,salary,salary_type,emergency_contact,join_date} = req.body;
        if(!name || name.trim()===''){
            return res.status(400).json({
                success:false,
                message:"Name is required"
            })
        }

        const employee = await Employee.create({
            tenant_id,
            name:name.trim(),
            email:email||null,
            phone:phone || null,
            role:role || 'waiter',
            salary:salary || 0 , 
            salary_type:salary_type || 'monthly',
            address:address || null,
            emergency_contact:emergency_contact || null,
            join_date:join_date||null

        });

        return res.status(200).json({
            success:true,
            message:`${name} employee added`,
            data:employee
        })
    }
    catch(error){
        console.log("Error in creating employee",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const updateEmployee = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;
        const {name,email,phone,role,salary,salary_type,address,emergency_contact,join_date} = req.body;

        const employee = await Employee.findOne({
            where:{id,tenant_id,is_active:true}
        })

        if(!employee){
            return res.status(404).json({
                success:false,
                message:"Employee not found"
            })
        }

        await employee.update({
            ...(name !== undefined && {name}),
            ...(email !== undefined && {email}),
            ...(phone !== undefined && {phone}),
            ...(role !== undefined && {role}),
            ...(salary !== undefined && {salary}),
            ...(salary_type !== undefined && {salary_type}),
            ...(address !== undefined && {address}),
            ...(emergency_contact !== undefined && {emergency_contact}),
            ...(join_date !== undefined && {join_date})
        })

        return res.status(200).json({
            success:true,
            message:"Employee updated successfully",
            data:employee
        })
    }
    catch(error){
        console.log("update Employee error",error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const deleteEmployee = async(req,res)=>{
    try{
        const {id} = req.params;
        const tenant_id = req.user.tenant_id;

        const employee = await Employee.findOne({
            where:{
                id,tenant_id,is_active:true
            }
        })

        if(!employee){
            return res.status(404).json({
                success:false,
                message:"Employee not found"
            })
        }

        await employee.update({
            is_active:false
        })

        return res.status(200).json({
            success:true,
            message:`Employee deleted successfully ${employee.name}` 
        })
    }
    catch(error){
        console.log("deleted Employee error",error)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const markAttendance = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {employee_id,date,status,check_in,check_out,note} =req.body;

        if(!employee_id || !date || !status ){
            return res.status(400).json({success:false,message:"Please provide all required fields"})
        }

        let hours_worked = 0;
        if(check_in && check_out){
            const [ih,im] = check_in.split(":").map(Number);
            const [oh,om] = check_out.split(":").map(Number);
            hours_worked = ((oh*60+om)-(ih*60+im))/60;

        }

        const [attendance,created] = await Attendance.findOrCreate({
            where:{
                tenant_id,
                employee_id,
                date
            },
            defaults:{
                status,
                check_in : check_in || null,
                check_out : check_out || null,
                hours_worked,
                note:note || null
            }
        })

        if(!created){
            await attendance.update({
                status,
                check_in : check_in || null,
                check_out : check_out || null,
                hours_worked,
                note:note || null
            })
        }

        return res.status(200).json({success:true,message:"Attendance updated successfully",data:attendance})
    }
    catch(error){
        console.log("markAttendance error",error)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const getAttendance = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {employee_id,month,year} = req.query;

        const {where} = {tenant_id}
        if(employee_id){
            where.employee_id = employee_id
        }

        if(month && year){
            const startDate = `${year} -${String(month).padStart(2,"0")}-01`;
            const endDate = new Date(year,month,0).toISOString().split("T")[0];
            where.date = {
                [Op.between]:[startDate,endDate]
            }
        }

        const attendance = await Attendance.findAll({
            where,order:[['date','DESC']],
            include:[{
                model:Employee,
                attributes:['id','name','role']
            }]
        });

        return res.status(200).json({
            success:true,
            data:attendance
        })
    }
    catch(err){
        console.log("Error in getAttendance",err);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const genratePayroll = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {month , year} = req.body;

        if(!month || !year){
            return res.status(400).json({
                success:false,
                message:"Month and Year are required"
            })
        }

        const employees = await Employee.findAll({
            where:{
                tenant_id,
                is_active:true,
                salary_type:'monthly'

            }
        }) 

        const startDate = `${year}-${String(month).padStart(2,'0')}-01`;
        const dayInMonth = new Date(year,month,0).getDate();
        const endDate = `${year}-${String(month).padStart(2,'0')}-${dayInMonth}`

        const results = []
        for(const emp of employees){
            const existing = await Payroll.findOne({
                where:{
                    tenant_id,
                    employee_id:emp.id,
                    month,
                    year
                }
            })

            if(existing){
                results.push(existing)
            }

            const attendance = await Attendance.findAll({
                where:{
                    tenant_id,
                    employee_id:emp.id,
                    date:{
                        [Op.between]:[startDate,endDate]
                    }
                }
            });

            const days_worked = attendance.reduce((total,record)=>{
                if(record.status === 'present'){
                    return total+1
                }

                if(record.status === 'half-day'){
                    return total+0.5
                }

                if(record.status === 'leave'){
                    return total+1
                }

                return total
            },0)

            const day_absent = attendance.filter(record => record.status === 'absent').length

            const monthSalary = parseFloat(emp.salary)

            const perDay = monthSalary/dayInMonth

            const halfDayCount = attendance.filter(record => record.status === 'half-day').length

            const unpaidDays = day_absent + (halfDayCount * 0.5)

            const basicSalary = monthSalary

            const deduction = unpaidDays * perDay;

            const net_salary = Math.max(0, basicSalary - deduction);
            
            const payroll = await Payroll.create({
                tenant_id,
                employee_id:emp.id,
                month,
                year,
                days_worked,
                day_absent,
                basicSalary,
                deduction,
                bonuses:0,
                net_salary

            })

            results.push(payroll)
        }

        return res.status(200).json({
            success:true,
            message:'Payroll generated successfully',
            data:results
        })
    }
    catch(error){
        console.log("genratePayroll error",error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const getPayroll = async (req,res)=>{
    try{

        const tenant_id = req.user.tenant_id;
        const {
            month,year
        } = req.query;

        const where = {tenant_id}

        if(month){
            where.month = month
        }

        if(year){
            where.year = year
        }

        const payroll = await Payroll.findAll({
            where,
            order:[['month','DESC'],['year','DESC']],
            include:[{model:Employee , attributes:['id','name','role']}]

        });
        return res.status(200).json({
            success:true,
            message:'Payroll fetched successfully',
            data:payroll
        })
    }
    catch(error){
        console.log("getPayroll error")
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}


export const markPayrollPaid = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.bdoy;

        const payroll = await Payroll.findOne({
            where:{
                id,tenant_id,
            }
        })

        if(!payroll){
            return res.status(404).json({
                success:false,
                message:'Payroll not found'
            })
        }

        await payroll.update({
            status:'paid',
            paid_at: new Date()
        })

        return res.status(200).json({
            success:true,
            message:'Payroll marked as paid',
            data:payroll
        })
    }
    catch(error){
        console.log("markedPayrollPaid error")
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }

}