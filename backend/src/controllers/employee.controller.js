import {Employee,Attendance,Payroll,Shift} from '../models/index.js';
import { Op } from 'sequelize';

const timeToMinutes = (t) => {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
};

// Compares an actual check-in/check-out against a shift's fixed timing and
// returns how many minutes late / how many minutes of overtime were worked.
// Handles overnight shifts (e.g. Night: 22:00 -> 06:00) where the end time
// is numerically smaller than the start time.
const calculateShiftDeviation = (shift, check_in, check_out) => {
    if (!shift || !check_in || !check_out) {
        return { late_minutes: 0, overtime_minutes: 0 };
    }

    const grace = shift.grace_minutes || 0;
    let shiftStart = timeToMinutes(shift.start_time);
    let shiftEnd = timeToMinutes(shift.end_time);
    let actualIn = timeToMinutes(check_in);
    let actualOut = timeToMinutes(check_out);

    if (shiftEnd <= shiftStart) {
        // overnight shift - push end time past midnight for comparison
        shiftEnd += 24 * 60;
        if (actualIn < shiftStart) actualIn += 24 * 60;
    }
    if (actualOut < actualIn) actualOut += 24 * 60;

    const late_minutes = Math.max(0, actualIn - shiftStart - grace);
    const overtime_minutes = Math.max(0, actualOut - shiftEnd);

    return { late_minutes, overtime_minutes };
};


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

        const recentAttendance = await Attendance.findAll({
            where:{
                tenant_id,
                employee_id:id
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
        const {name,email,phone,address,role,salary,salary_type,emergency_contact,join_date,shift_id} = req.body;
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
            join_date:join_date||null,
            shift_id:shift_id || null

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
        const {name,email,phone,role,salary,salary_type,address,emergency_contact,join_date,shift_id} = req.body;

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
            ...(join_date !== undefined && {join_date}),
            ...(shift_id !== undefined && {shift_id: shift_id || null})
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

        const employee = await Employee.findOne({ where:{ id:employee_id, tenant_id } });
        let shift = null;
        if (employee?.shift_id) {
            shift = await Shift.findOne({ where:{ id:employee.shift_id, tenant_id } });
        }
        const { late_minutes, overtime_minutes } = calculateShiftDeviation(shift, check_in, check_out);

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
                shift_id: employee?.shift_id || null,
                late_minutes,
                overtime_minutes,
                note:note || null
            }
        })

        if(!created){
            await attendance.update({
                status,
                check_in : check_in || null,
                check_out : check_out || null,
                hours_worked,
                shift_id: employee?.shift_id || null,
                late_minutes,
                overtime_minutes,
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

export const getAttendance = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { employee_id, month, year } = req.query;

    // FIX 1 — const {where} = {tenant_id} galat tha
    const where = { tenant_id };

    if (employee_id) {
      where.employee_id = employee_id;
    }

    if (month && year) {
      // FIX 2 — space hata diya year ke baad
      const startDate   = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate     = new Date(year, month, 0).toISOString().split('T')[0];
      where.date        = { [Op.between]: [startDate, endDate] };
    }

    const attendance = await Attendance.findAll({
      where,
      order: [['date', 'DESC']],
      include: [{
        model:      Employee,
        attributes: ['id', 'name', 'role']
      }]
    });

    return res.status(200).json({ success: true, data: attendance });

  } catch (err) {
    console.log('Error in getAttendance', err);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// One date, every active employee - with their attendance record for that
// date already filled in if it exists (null fields if not marked yet).
// This powers the "mark everyone at once" grid view.
export const getAttendanceByDate = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: "date is required" });
    }

    const employees = await Employee.findAll({
      where: { tenant_id, is_active: true },
      attributes: ['id', 'name', 'role', 'shift_id'],
      include: [{ model: Shift, attributes: ['id', 'name', 'start_time', 'end_time'] }],
      order: [['name', 'ASC']]
    });

    const records = await Attendance.findAll({
      where: { tenant_id, date }
    });

    const byEmployeeId = {};
    records.forEach(r => { byEmployeeId[r.employee_id] = r; });

    const grid = employees.map(emp => {
      const existing = byEmployeeId[emp.id];
      return {
        employee_id: emp.id,
        name: emp.name,
        role: emp.role,
        shift_name: emp.Shift ? emp.Shift.name : null,
        status: existing ? existing.status : null,
        check_in: existing ? existing.check_in : null,
        check_out: existing ? existing.check_out : null,
        late_minutes: existing ? existing.late_minutes : 0,
        overtime_minutes: existing ? existing.overtime_minutes : 0,
        note: existing ? existing.note : null,
        already_marked: !!existing
      };
    });

    return res.status(200).json({ success: true, data: { date, employees: grid } });
  } catch (error) {
    console.log("getAttendanceByDate error", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// Save the whole grid in one request - upserts attendance for every
// employee row that was actually filled in (status !== null); rows left
// blank are skipped so you don't have to mark everyone every single day.
export const markBulkAttendance = async (req, res) => {
  try {
    const tenant_id = req.user.tenant_id;
    const { date, records } = req.body;

    if (!date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ success: false, message: "date and records are required" });
    }

    const results = [];
    const employeeIds = records.filter(r => r.employee_id).map(r => r.employee_id);
    const employeesById = {};
    if (employeeIds.length > 0) {
        const emps = await Employee.findAll({ where: { tenant_id, id: { [Op.in]: employeeIds } } });
        emps.forEach(e => { employeesById[e.id] = e; });
    }
    const shiftsById = {};
    const shiftIds = [...new Set(Object.values(employeesById).map(e => e.shift_id).filter(Boolean))];
    if (shiftIds.length > 0) {
        const shifts = await Shift.findAll({ where: { tenant_id, id: { [Op.in]: shiftIds } } });
        shifts.forEach(s => { shiftsById[s.id] = s; });
    }

    for (const rec of records) {
      if (!rec.employee_id || !rec.status) continue;

      let hours_worked = 0;
      if (rec.check_in && rec.check_out) {
        const [ih, im] = rec.check_in.split(":").map(Number);
        const [oh, om] = rec.check_out.split(":").map(Number);
        hours_worked = ((oh * 60 + om) - (ih * 60 + im)) / 60;
      }

      const emp = employeesById[rec.employee_id];
      const shift = emp?.shift_id ? shiftsById[emp.shift_id] : null;
      const { late_minutes, overtime_minutes } = calculateShiftDeviation(shift, rec.check_in, rec.check_out);

      const [attendance, created] = await Attendance.findOrCreate({
        where: { tenant_id, employee_id: rec.employee_id, date },
        defaults: {
          status: rec.status,
          check_in: rec.check_in || null,
          check_out: rec.check_out || null,
          hours_worked,
          shift_id: emp?.shift_id || null,
          late_minutes,
          overtime_minutes,
          note: rec.note || null
        }
      });

      if (!created) {
        await attendance.update({
          status: rec.status,
          check_in: rec.check_in || null,
          check_out: rec.check_out || null,
          hours_worked,
          shift_id: emp?.shift_id || null,
          late_minutes,
          overtime_minutes,
          note: rec.note || null
        });
      }

      results.push(attendance);
    }

    return res.status(200).json({
      success: true,
      message: `Attendance saved for ${results.length} employee(s)`,
      data: results
    });
  } catch (error) {
    console.log("markBulkAttendance error", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

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
                continue
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

                if(record.status === 'half_day'){
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

            const halfDayCount = attendance.filter(record => record.status === 'half_day').length

            const unpaidDays = day_absent + (halfDayCount * 0.5)

            const basicSalary = monthSalary

            let lateDeduction = 0;
            let overtimeBonus = 0;

            if (emp.shift_id) {
                const shift = await Shift.findOne({ where: { id: emp.shift_id, tenant_id } });
                if (shift) {
                    let shiftStart = timeToMinutes(shift.start_time);
                    let shiftEnd = timeToMinutes(shift.end_time);
                    if (shiftEnd <= shiftStart) shiftEnd += 24 * 60; // overnight shift
                    const shiftMinutes = shiftEnd - shiftStart;

                    const totalLateMinutes = attendance.reduce((sum, r) => sum + (r.late_minutes || 0), 0);
                    const totalOvertimeMinutes = attendance.reduce((sum, r) => sum + (r.overtime_minutes || 0), 0);

                    const perMinuteRate = shiftMinutes > 0 ? perDay / shiftMinutes : 0;
                    lateDeduction = totalLateMinutes * perMinuteRate;
                    overtimeBonus = totalOvertimeMinutes * perMinuteRate * 1.5; // 1.5x rate for overtime
                }
            }

            const deduction = (unpaidDays * perDay) + lateDeduction;

            const net_salary = Math.max(0, basicSalary - deduction + overtimeBonus);
            
            const payroll = await Payroll.create({
                tenant_id,
                employee_id:emp.id,
                month,
                year,
                days_worked,
                days_absent: day_absent,
                basic_salary: basicSalary,
                deductions: deduction,
                bonuses: overtimeBonus,
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
        const {id} = req.params;

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