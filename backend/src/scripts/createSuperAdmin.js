import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { sequelize, User, Role } from '../models/index.js';

const run = async () => {
  const [, , name, email, password] = process.argv;

  if (!name || !email || !password) {
    console.error('Usage: node src/scripts/createSuperAdmin.js "Admin Name" admin@email.com "Password123"');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }

  try {
    await sequelize.authenticate();

    let role = await Role.findOne({ where: { name: 'super_admin', tenant_id: null } });
    if (!role) {
      role = await Role.create({
        name: 'super_admin',
        tenant_id: null,
        permissions: { all: true },
      });
      console.log('Created super_admin role.');
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      console.error(`A user with email ${email} already exists (id: ${existing.id}). Aborting.`);
      process.exit(1);
    }

    const password_hash = await bcrypt.hash(password, 12);

    const user = await User.create({
      id: uuidv4(),
      tenant_id: null,
      name,
      email,
      password_hash,
      role_id: role.id,
      is_active: true,
    });

    console.log('✅ Super admin created:', user.id, user.email);
    process.exit(0);
  } catch (error) {
    console.error('Failed to create super admin:', error);
    process.exit(1);
  }
};

run();