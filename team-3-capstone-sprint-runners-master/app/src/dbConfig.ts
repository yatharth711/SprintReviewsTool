import dotenv from 'dotenv';

dotenv.config();

interface DBConfig {
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

const development: DBConfig = {
  host: process.env.DEV_DB_HOST || 'db',
  port: parseInt(process.env.DEV_DB_PORT || '3306', 10),
  user: process.env.DEV_DB_USER || 'root',
  password: process.env.DEV_DB_PASSWORD || 'SprintRunners',
  database: process.env.DEV_DB_NAME || 'mydb',
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
};

const production: DBConfig = {
  host: process.env.PROD_DB_HOST || 'db',
  port: parseInt(process.env.PROD_DB_PORT || '3307', 10),
  user: process.env.PROD_DB_USER || 'root',
  password: process.env.PROD_DB_PASSWORD || 'SprintRunners',
  database: process.env.PROD_DB_NAME || 'mydb',
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
};

const testing: DBConfig = {
    host: process.env.DEV_DB_HOST || 'testdb',
    port: parseInt(process.env.DEV_DB_PORT || '3306', 10),
    user: process.env.DEV_DB_USER || 'root',
    password: process.env.DEV_DB_PASSWORD || 'SprintRunnersTest',
    database: process.env.DEV_DB_NAME || 'testdb',
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

const localhost: DBConfig = {
  host: 'localhost',
  port: 3307,
  user: process.env.DEV_DB_USER || 'root',
  password: process.env.DEV_DB_PASSWORD || 'SprintRunners',
  database: process.env.DEV_DB_NAME || 'mydb',
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0,
};

const config = {
  development,
  production,
  testing,
  localhost,
};

export default config;