// Run this manually (node scripts/sync-alter.js) ONE TIME whenever you add
// or change model fields. Do NOT wire this into the normal `npm run dev`
// flow - running alter:true on every nodemon restart accumulates duplicate
// unique indexes on MySQL until you hit the 64-key-per-table limit.
import 'dotenv/config';
import { sequelize } from '../models/index.js';

const run = async () => {
    try {
        await sequelize.authenticate();
        console.log('DB connected, altering schema...');
        await sequelize.sync({ alter: true });
        console.log('Schema altered successfully. You can Ctrl+C now.');
        process.exit(0);
    } catch (error) {
        console.error('Alter failed:', error);
        process.exit(1);
    }
};

run();