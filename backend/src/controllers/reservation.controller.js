// import {Reservation,Tables} from '../models/index.js'
// import { Op } from 'sequelize';

// export const getAllReservations = async (req,res)=>{
//     try{
//     const tenant_id = req.user.tenant_id;
//     const {status,date} = req.query;

//     const where = {tenant_id};
//     if(status) where.status = status;

//     if(date) where.reservation_date = date;
//     else {
//       where.reservation_date = { [Op.gte]: new Date().toISOString().split('T')[0] };
//     }

//     const reservation = await Reservation.findAll({
//         where,
//         order:[['reservation_date','ASC'],['reservation_time','ASC']],
//         include:[{model:Tables , attributes:['table_number','id','capacity'],required:false}]
//     })

//     if(!reservation){
//         return res.status(404).json({message:"No Reservations Found"})
//     }

//     return res.status(200).json({
//         success:true,
//         data:reservation
//     })
// }
// catch(err){
//     console.log("getAll Reservations Error",err)
//     return res.status(500).json({
//         success:false,
//         message:"Internal Server Error"
//     })
// }
// }

// export const getReservationId = async(req,res)=>{
//     try{
//         const tenant_id = req.user.tenant_id;
//         const {id} = req.params;

//         const reservation = await Reservation.findOne({
//             where:{id,tenant_id},
//             include:[{model:Tables,attributes:['table_number','id'],required:false}]
//         })

//         if(!reservation){
//             return res.status(404).json({
//                 success:false,
//                 message:"Reservation not found"
//             })
//         }

//         return res.status(200).json({
//             success:true,
//             data:reservation
//         })
//     }
//     catch(err){
//         console.log("getReservationId Error",err)
//         return res.status(500).json({
//             success:false,
//             message:"Internal Server Error"
//         })
//     }
// }

// export const createReservation = async(req,res)=>{
//     try{
//         const tenant_id = req.user.tenant_id;
//         const {customer_name,customer_phone,table_id,customer_id,
//             reservation_date,reservation_time,
//             guests,special_request,notes
//         } = req.body;

//         if (!customer_name || !customer_phone ){
//             return res.status(400).json({success:false,message:"Please provide customer name and phone number"})
//         }

//         if (!reservation_date || !reservation_time){
//             return res.status(400).json({success:false,message:"Please provide reservation date and time"})
//         }

//         if(!guests || guests < 1){
//             return res.status(400).json({success:false,message:"Please prvide number of guests"})
//         }

//         const reservation = await Reservation.create({
//             tenant_id,
//             customer_name,
//             customer_phone,
//             customer_id:customer_id || null,
//             table_id:table_id || null,
//             customer_id,
//             reservation_date,
//             reservation_time,
//             guests,
//             status:'confirmed',
//             special_request:special_request || null,
//             notes:notes || null
//         });

//         return res.status(200).json({
//             success:true,
//             message:"Reservation created successfully",
//             data:reservation
//         })
//     }
//     catch(err){
//         console.log("Error creating reservation",err)
//         return res.status(500).json({
//             success:false,
//             message:"Internal Server Error"
//         })
//     }
// }


// export const updateReservation = async(req,res)=>{
//     try{
//         const tenant_id = req.user.tenant_id;
//         const {id} = req.params;
//         const {customer_name,customer_phone,customer_id,table_id,reservation_date,reservation_time,guests,special_request,notes} = req.body;

//         const reservation = await Reservation.findOne({where:{id,tenant_id}});

//         if(!reservation){
//             return res.status(404).json({
//                 success:false,
//                 message:"Reservation not found"
//             })
//         }

//         await reservation.update({
//             ...(customer_name !== undefined && {customer_name}),
//             ...(customer_phone !== undefined && {customer_phone}),
//             ...(table_id !== undefined && {table_id}),
//             ...(reservation_date !== undefined && {reservation_date}),
//             ...(reservation_time !== undefined && {reservation_time}),
//             ...(guests !== undefined && {guests}),
//             ...(special_request !== undefined && {special_request}),
//             ...(notes !== undefined && {notes})
//         })

//         return res.status(200).json({
//             success:true,
//             message:"Reservation updated successfully"
//         })
//     }
//     catch(error){
//         console.log("Error updating reservation",error);
//         return res.status(500).json({
//             success:false,
//             message:"Internal Server Error"
//         })
//     }
// }

// export const deleteReservation = async(req,res)=>{
//     try{
//         const tenant_id = req.user.tenant_id;
//         const {id} = req.params;

//         const reservation = await Reservation.findOne({where:{id,tenant_id}});
//         if(!reservation){
//             return res.status(400).json({
//                 success:false,
//                 message:"Reservation not found"
//             })
//         }

//         await reservation.destroy();

//         return res.status(200).json({
//             success:true,
//             message:"Reservation deleted successfully"
//         })
//     }
//     catch(error){
//         console.log("Error deleting reservation",error);
//         return res.status(500).json({
//             success:false,
//             message:"Internal Server Error"
//         })
//     }
// }

// export const getTodayReservation = async(req,res)=>{
//     try{
//         const tenant_id = req.user.tenant_id;
//         const today = new Date().toISOString().split('T')[0];

//         const reservations = await Reservation.findAll({
//             where:{
//                 tenant_id,
//                 reservation_date:today,
//                 status:{[Op.notIn]:['cancelled','no_show']}
//             },
//             order:[['reservation_time','ASC']],
//             include:[{
//                 model:Tables,
//                 attributes:['table_number','id'],
//                 required:true
//             }]
//         })

//         return res.status(200).json({
//             success:true,
//             data:reservations
//         })
//     }
//     catch(error){
//         console.log("Error getting today's reservation",error);
//         return res.status(500).json({
//             success:false,
//             message:"Internal Server Error"
//         })
//     }
// }

// export const updateStatus = async(req,res)=>{
//     try{
//         const tenant_id = req.user.tenant_id;
//         const {status} =req.body;
//         const {id} = req.params;

//         const valid = ['pending','confirmed','cancelled','seated','completed','no_show']

//         if(!valid.includes(status)){
//             return res.status(400).json({
//                 success:false,
//                 message:"Invalid status"
//             })
//         }

//         const reservation = await Reservation.findOne({
//             where:{
//                 id,tenant_id
//             }
//         })

//         if(!reservation){
//             return res.status(404).json({
//                 success:false,
//                 message:"Reservation not found"
//             })
//         }

//         await reservation.update({
//             status
//         })

//         if(status === 'seated' && reservation.table_id){
//             await Tables.update({
//                 status:'occupied',
//                 where:{
//                     id:reservation.table_id,
//                     tenant_id
//                 }
//             })

//         }

//     return res.status(200).json({
//         success:true,
//         message:"Reservation status updated successfully"
//     })

//     }
//     catch(error){
//         console.log("Error updating reservation status",error)
//         return res.status(500).json({
//             success:false,
//             message:"Internal server error"
//         })
//     }
// }

import {Reservation,Tables,Branch} from '../models/index.js'
import { Op } from 'sequelize';

export const getAllReservations = async (req,res)=>{
    try{
    const tenant_id = req.user.tenant_id;
    const {status,date,branch_id} = req.query;

    const where = {tenant_id};
    if(status) where.status = status;
    if(branch_id) where.branch_id = branch_id;

    if(date) where.reservation_date = date;
    else {
      where.reservation_date = { [Op.gte]: new Date().toISOString().split('T')[0] };
    }

    const reservation = await Reservation.findAll({
        where,
        order:[['reservation_date','ASC'],['reservation_time','ASC']],
        include:[{model:Tables , attributes:['table_number','id','capacity'],required:false}]
    })

    if(!reservation){
        return res.status(404).json({message:"No Reservations Found"})
    }

    return res.status(200).json({
        success:true,
        data:reservation
    })
}
catch(err){
    console.log("getAll Reservations Error",err)
    return res.status(500).json({
        success:false,
        message:"Internal Server Error"
    })
}
}

export const getReservationId = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;

        const reservation = await Reservation.findOne({
            where:{id,tenant_id},
            include:[{model:Tables,attributes:['table_number','id'],required:false}]
        })

        if(!reservation){
            return res.status(404).json({
                success:false,
                message:"Reservation not found"
            })
        }

        return res.status(200).json({
            success:true,
            data:reservation
        })
    }
    catch(err){
        console.log("getReservationId Error",err)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const createReservation = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {customer_name,customer_phone,table_id,customer_id,
            reservation_date,reservation_time,
            guests,special_request,notes,branch_id
        } = req.body;

        if (!customer_name || !customer_phone ){
            return res.status(400).json({success:false,message:"Please provide customer name and phone number"})
        }

        if (!reservation_date || !reservation_time){
            return res.status(400).json({success:false,message:"Please provide reservation date and time"})
        }

        if(!guests || guests < 1){
            return res.status(400).json({success:false,message:"Please prvide number of guests"})
        }

        // Reservation's branch: table's branch takes priority, else whatever
        // branch was explicitly picked, else the tenant's main branch.
        let resolvedBranchId = branch_id || null;
        if (table_id) {
            const table = await Tables.findOne({ where: { id: table_id, tenant_id } });
            if (table?.branch_id) resolvedBranchId = table.branch_id;
        }
        if (!resolvedBranchId) {
            const mainBranch = await Branch.findOne({ where: { tenant_id, is_main: true } });
            resolvedBranchId = mainBranch ? mainBranch.id : null;
        }

        const reservation = await Reservation.create({
            tenant_id,
            branch_id: resolvedBranchId,
            customer_name,
            customer_phone,
            customer_id:customer_id || null,
            table_id:table_id || null,
            customer_id,
            reservation_date,
            reservation_time,
            guests,
            status:'confirmed',
            special_request:special_request || null,
            notes:notes || null
        });

        return res.status(200).json({
            success:true,
            message:"Reservation created successfully",
            data:reservation
        })
    }
    catch(err){
        console.log("Error creating reservation",err)
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}


export const updateReservation = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;
        const {customer_name,customer_phone,customer_id,table_id,reservation_date,reservation_time,guests,special_request,notes} = req.body;

        const reservation = await Reservation.findOne({where:{id,tenant_id}});

        if(!reservation){
            return res.status(404).json({
                success:false,
                message:"Reservation not found"
            })
        }

        await reservation.update({
            ...(customer_name !== undefined && {customer_name}),
            ...(customer_phone !== undefined && {customer_phone}),
            ...(table_id !== undefined && {table_id}),
            ...(reservation_date !== undefined && {reservation_date}),
            ...(reservation_time !== undefined && {reservation_time}),
            ...(guests !== undefined && {guests}),
            ...(special_request !== undefined && {special_request}),
            ...(notes !== undefined && {notes})
        })

        return res.status(200).json({
            success:true,
            message:"Reservation updated successfully"
        })
    }
    catch(error){
        console.log("Error updating reservation",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const deleteReservation = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {id} = req.params;

        const reservation = await Reservation.findOne({where:{id,tenant_id}});
        if(!reservation){
            return res.status(400).json({
                success:false,
                message:"Reservation not found"
            })
        }

        await reservation.destroy();

        return res.status(200).json({
            success:true,
            message:"Reservation deleted successfully"
        })
    }
    catch(error){
        console.log("Error deleting reservation",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const getTodayReservation = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const today = new Date().toISOString().split('T')[0];

        const reservations = await Reservation.findAll({
            where:{
                tenant_id,
                reservation_date:today,
                status:{[Op.notIn]:['cancelled','no_show']}
            },
            order:[['reservation_time','ASC']],
            include:[{
                model:Tables,
                attributes:['table_number','id'],
                required:true
            }]
        })

        return res.status(200).json({
            success:true,
            data:reservations
        })
    }
    catch(error){
        console.log("Error getting today's reservation",error);
        return res.status(500).json({
            success:false,
            message:"Internal Server Error"
        })
    }
}

export const updateStatus = async(req,res)=>{
    try{
        const tenant_id = req.user.tenant_id;
        const {status} =req.body;
        const {id} = req.params;

        const valid = ['pending','confirmed','cancelled','seated','completed','no_show']

        if(!valid.includes(status)){
            return res.status(400).json({
                success:false,
                message:"Invalid status"
            })
        }

        const reservation = await Reservation.findOne({
            where:{
                id,tenant_id
            }
        })

        if(!reservation){
            return res.status(404).json({
                success:false,
                message:"Reservation not found"
            })
        }

        await reservation.update({
            status
        })

        if(status === 'seated' && reservation.table_id){
            await Tables.update({
                status:'occupied',
                where:{
                    id:reservation.table_id,
                    tenant_id
                }
            })

        }

    return res.status(200).json({
        success:true,
        message:"Reservation status updated successfully"
    })

    }
    catch(error){
        console.log("Error updating reservation status",error)
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}