import { query } from '../../db'; // Import the query function from db.ts
import fs from 'fs/promises';

async function initializeDatabase() {
  try {
    const sql = await fs.readFile('../init.sql', { encoding: 'utf8' });
    await query(sql);
    console.log('Database initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1); // Exit the process with an error code
  }
}
initializeDatabase(); // Start the db initialization process