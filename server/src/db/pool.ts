/**
 * PostgreSQL Connection Pool
 * ===========================
 * Manages database connections with pooling for optimal performance.
 * 
 * Configuration via environment variable:
 * - DATABASE_URL: PostgreSQL connection string
 */
import pg from 'pg';

const { Pool } = pg;

// Create connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,                        // Maximum pool size
    idleTimeoutMillis: 30000,       // Close idle clients after 30s
    connectionTimeoutMillis: 2000,  // Timeout for new connections
    allowExitOnIdle: true,          // Allow process to exit if pool is idle
});

// Pool error handler
pool.on('error', (err) => {
    console.error('[DB] Unexpected pool error:', err.message);
});

/**
 * Test database connection
 * @returns Promise<boolean> - true if connection successful
 */
export async function testConnection(): Promise<boolean> {
    try {
        const client = await pool.connect();
        await client.query('SELECT 1');
        client.release();
        return true;
    } catch (error) {
        console.error('[DB] Connection test failed:', (error as Error).message);
        return false;
    }
}

/**
 * Execute a query with automatic connection management
 * @param text - SQL query string
 * @param params - Query parameters
 */
export async function query<T = unknown>(
    text: string,
    params?: unknown[]
): Promise<pg.QueryResult<T>> {
    const start = Date.now();
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === 'development') {
        console.log(`[DB] Query executed in ${duration}ms, rows: ${result.rowCount}`);
    }

    return result;
}

/**
 * Get a client for transaction handling
 */
export async function getClient(): Promise<pg.PoolClient> {
    return pool.connect();
}

export default pool;
