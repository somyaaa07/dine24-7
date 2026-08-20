import { Shift, Employee } from '../models/index.js';

export const getAllShifts = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const shifts = await Shift.findAll({
            where: { tenant_id, is_active: true },
            order: [['start_time', 'ASC']]
        });
        return res.status(200).json({ success: true, data: shifts });
    } catch (error) {
        console.log("getAllShifts failed", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const createShift = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { name, start_time, end_time, grace_minutes } = req.body;

        if (!name || !start_time || !end_time) {
            return res.status(400).json({ success: false, message: "name, start_time and end_time are required" });
        }

        const shift = await Shift.create({
            tenant_id,
            name,
            start_time,
            end_time,
            grace_minutes: grace_minutes ?? 10
        });

        return res.status(201).json({ success: true, data: shift });
    } catch (error) {
        console.log("createShift failed", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const updateShift = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;
        const { name, start_time, end_time, grace_minutes, is_active } = req.body;

        const shift = await Shift.findOne({ where: { id, tenant_id } });
        if (!shift) {
            return res.status(404).json({ success: false, message: "Shift not found" });
        }

        if (name !== undefined) shift.name = name;
        if (start_time !== undefined) shift.start_time = start_time;
        if (end_time !== undefined) shift.end_time = end_time;
        if (grace_minutes !== undefined) shift.grace_minutes = grace_minutes;
        if (is_active !== undefined) shift.is_active = is_active;

        await shift.save();
        return res.status(200).json({ success: true, data: shift });
    } catch (error) {
        console.log("updateShift failed", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const deleteShift = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;

        const shift = await Shift.findOne({ where: { id, tenant_id } });
        if (!shift) {
            return res.status(404).json({ success: false, message: "Shift not found" });
        }

        const employeeCount = await Employee.count({ where: { tenant_id, shift_id: id, is_active: true } });
        if (employeeCount > 0) {
            return res.status(400).json({
                success: false,
                message: `${employeeCount} employee(s) are still assigned to this shift. Reassign them first.`
            });
        }

        await shift.destroy();
        return res.status(200).json({ success: true, message: "Shift deleted" });
    } catch (error) {
        console.log("deleteShift failed", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// Convenience: one click to set up the 3 common restaurant shifts instead of
// creating them one by one. Skips any that already exist by name.
export const seedDefaultShifts = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;

        const defaults = [
            { name: 'Morning', start_time: '09:00:00', end_time: '17:00:00' },
            { name: 'Evening', start_time: '14:00:00', end_time: '22:00:00' },
            { name: 'Night',   start_time: '22:00:00', end_time: '06:00:00' },
        ];

        const existing = await Shift.findAll({ where: { tenant_id } });
        const existingNames = existing.map(s => s.name);

        const toCreate = defaults
            .filter(d => !existingNames.includes(d.name))
            .map(d => ({ ...d, tenant_id, grace_minutes: 10 }));

        const created = toCreate.length > 0 ? await Shift.bulkCreate(toCreate) : [];

        const allShifts = await Shift.findAll({ where: { tenant_id }, order: [['start_time', 'ASC']] });

        return res.status(200).json({
            success: true,
            message: `${created.length} shift(s) created`,
            data: allShifts
        });
    } catch (error) {
        console.log("seedDefaultShifts failed", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};