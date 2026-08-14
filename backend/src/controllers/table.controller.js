import { Tables as Table, AuditLog } from '../models/index.js';

export const getAllTables = async (req, res) => {

    try {
        const tenant_id = req.user.tenant_id;
        const tables = await Table.findAll({ where: { tenant_id, is_active: true }, order: [['section', 'ASC'], ['table_number', 'ASC']] });

        const grouped = tables.reduce((acc, table) => {
            const section = table.section || 'main section';
            if (!acc[section]) acc[section] = [];
            acc[section].push(table);
            return acc
        }, {})

        return res.status(200).json({
            success: true,
            data: {
                tables,
                grouped
            }
        })
    }

    catch (error) {
        console.log('failed to get tables', error);
        return res.status(500).json({
            success: false,
            message: 'server error'
        })
    }
}


export const getTableById = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;

        const table = await Table.findOne({ where: { id, tenant_id, is_active: true } });

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'table not found'
            })
        }

        return res.status(200).json({
            success: true,
            data: table
        });
    }
    catch (error) {
        console.log('failed to get table', error);
        return res.status(500).json({
            success: false,
            message: 'server error'
        })
    }

}

export const createTable = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { table_number, capacity, section } = req.body;

        if (!table_number) {
            return res.status(400).json({
                success: false,
                message: 'table number is required'
            })
        }

        if (!capacity || capacity < 1) {
            return res.status(400).json({
                success: false,
                message: 'capcity is required and should be greater than 0'
            })
        }

        const existing = await Table.findOne({ where: { tenant_id, table_number, is_active: true } });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: `table number ${table_number} already exists`
            })
        }

        // now we're going to have QR which helps to make the online ordering

 const qr_code = `${process.env.APP_URL}/order?tenant_id=${tenant_id}&table=${table_number}`;
        const table = await Table.create({
            tenant_id,
            table_number,
            capacity,
            section: section || 'Main Hall',
            status: 'available',
            qr_code
        })

        await AuditLog.create({
            tenant_id,
            user_id: req.user.id,
            action: 'Table_Created',
            ip_address: req.ip,
            details: { table_number, capacity, section }
        });

        return res.status(201).json({
            success: true,
            message: 'Table created successfully',
            data: table
        })


    }
    catch (error) {
        console.log('get fail to create table', error);
        return res.status(500).json({
            success: false,
            message: 'server error'
        })
    }
}

export const createBulkTable = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { section, capacity, prefix, from_number, to_number } = req.body;


        if (!from_number || !to_number || from_number > to_number) {
            return res.status(400).json({
                success: false,
                message: 'from and to number must be valid'
            })
        }

        if (to_number - from_number > 50) {
            return res.status(400).json({
                success: false,
                message: 'you can create maximum 50 tables at a time'
            })
        }

        const tablesToCreate = [];
        const skipped = [];

        for (let i = from_number; i <= to_number; i++) {
            const table_number = `${prefix || 'T'}${i}`;

            const exisiting = await Table.findOne({
                where: {
                    tenant_id,
                    table_number,
                    is_active: true
                }
            })

            if (exisiting) {
                skipped.push(table_number);
                continue;
            }

            tablesToCreate.push({
                tenant_id,
                table_number,
                capacity: capacity || 4,
                section: section || 'Main Hall',
                status: 'available',
  qr_code: `${process.env.APP_URL}/order?tenant_id=${tenant_id}&table=${table_number}`
            });
        }

        const created = await Table.bulkCreate(tablesToCreate);

        return res.status(200).json({
            success: true,
            created: created.length,
            skipped: skipped.length,
            skipped_tables: skipped

        })
    }
    catch (error) {
        console.log("Bulk table creation got failed", error)
        return res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}


export const updateTable = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;
        const { table_number, section, capacity } = req.body;

        const table = await Table.findOne({
            where: {
                id,
                tenant_id,
                is_active: true
            }
        })

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Table not found"
            })
        }

        if (table.status === "occupied" && (table_number || section)) {
            return res.status(400).json({
                success: false,
                message: "Cannot update table number or section when table is occupied"
            })
        }

        if (table_number && table_number !== table.table_number) {
            const exisiting = await Table.findOne({
                where: {
                    tenant_id,
                    table_number,
                    is_active: true
                }
            });

            if (exisiting) {
                return res.status(400).json({
                    success: false,
                    message: `Table number already exists ${table_number}`
                });

            }
        }

        await table.update({
            ...(table_number && { table_number }),
            ...(section && { section }),
            ...(capacity && { capacity })
        })

        return res.status(200).json({
            success: true,
            message: "Table updated successfully",
            data: table
        })
    }
    catch (error) {
        console.log("Error on updating table", error);
        return res.status(500).json({
            success: false,
            message: "Server Error"
        })
    }
}


// updated status - table status update
export const updateStatus = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params;
        const { status } = req.body;

        const validStatus = [
            'available',
            'occupied',
            'reserved',
            'cleaning'
        ]

        if (!validStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be between in ${validStatus.join(", ")}`
            })
        }

        const table = await Table.findOne({
            where: {
                id,
                tenant_id,
                is_active: true
            }
        })

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "Table not found"
            })
        }

        if (table.status === 'occupied' && status === 'available') {
            return res.status(400).json({
                success: false,
                message: "table firstly will go on cleaning phir available"
            })
        }

        const previousStatus = table.status;
        await table.update({ status });

        await AuditLog.create({
            tenant_id,
            user_id: req.user.id,
            action: 'Table_status_changed',
            ip_address: req.ip,
            details: {
                table_number: table.table_number,
                from: previousStatus,
                to: status
            }

        })

        return res.status(200).json({
            success: true,
            message: `table ${table.table_number} status changed to ${status}`,
            data: table
        })
    }
    catch (error) {
        console.log("updating status got failed", error)
        return res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}


export const deleteTable = async (req, res) => {
    try {
        const tenant_id = req.user.tenant_id;
        const { id } = req.params
        const table = await Table.findOne({
            where: {
                id,
                tenant_id,
                is_active: true
            }
        })

        if (!table) {
            return res.status(404).json({
                success: false,
                message: "table not found"
            })
        }

        if (table.status === 'occupied') {
            return res.status(400).json({
                success: false,
                message: "occupied table can't be deleted"
            })
        }

        // we'll do soft delete instead of hardcode delete
        await table.update({
            is_active: false
        })

        await AuditLog.create({
            tenant_id,
            user_id: req.user.id,
            action: 'TABLE_DELETED',
            ip_address: req.ip,
            details: { table_number: table.table_number }
        })

        return res.status(200).json({
            success: true,
            message: "table deleted successfully"
        })
    }

    catch (error) {
        console.log("failed to delete table", error)
        return res.status(500).json({
            success: false,
            message: "server error"
        })
    }
}