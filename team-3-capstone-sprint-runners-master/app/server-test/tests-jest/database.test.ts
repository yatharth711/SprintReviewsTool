// __tests__/database.test.tsx
import mysql from 'mysql2/promise';

declare global {
  var pool: mysql.Pool;
}

describe('Database Tests', () => {
  let connection: mysql.PoolConnection;

  beforeAll(async () => {
    try {
      connection = await global.pool.getConnection();
    } catch (error) {
      console.error('Error getting database connection:', error);
      throw error;
    }
  });

  afterAll(async () => {
    if (connection) {
      connection.release();
    }
  });

  test('should retrieve all users', async () => {
    try {
      const [rows] = await connection.query('SELECT * FROM user');
      expect(rows).toBeDefined();
      expect(Array.isArray(rows)).toBe(true);
      if ((rows as any[]).length > 0) {
        expect((rows as any[])[0]).toHaveProperty('userID');
        expect((rows as any[])[0]).toHaveProperty('firstName');
        expect((rows as any[])[0]).toHaveProperty('lastName');
        expect((rows as any[])[0]).toHaveProperty('email');
        expect((rows as any[])[0]).toHaveProperty('pwd');
        expect((rows as any[])[0]).toHaveProperty('userRole');
      }
    } catch (error) {
      console.error('Error querying users:', error);
      throw error;
    }
  });
});
