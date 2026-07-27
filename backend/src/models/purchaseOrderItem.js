import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const PurchaseOrderItem = sequelize.define('PurchaseOrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tenant_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  purchase_order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  inventory_item_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity_ordered: {
    type: DataTypes.DECIMAL(10, 3),
    allowNull: false
  },
  quantity_received: {
    type: DataTypes.DECIMAL(10, 3),
    defaultValue: 0
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'purchase_order_items',
  timestamps: true
});

export default PurchaseOrderItem;