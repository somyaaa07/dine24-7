import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  supplier_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  po_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'sent', 'received', 'cancelled'),
    defaultValue: 'draft'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  expected_delivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  received_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  tableName: 'purchase_orders',
  timestamps: true
});

export default PurchaseOrder;