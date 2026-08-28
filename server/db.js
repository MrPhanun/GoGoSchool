const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: Number(process.env.DB_PORT) || 1433,
  database: process.env.DB_NAME || 'GoGoSchoolDB',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    // Local SQL Server uses a self-signed cert and no encryption by default;
    // Azure SQL (and most cloud SQL Server hosts) require encrypt: true and
    // a trusted cert. Override via .env for cloud deployments.
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
    encrypt: process.env.DB_ENCRYPT === 'true',
  },
};

let poolPromise = null;

function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config).connect();
  }
  return poolPromise;
}

// SQL Server DATE columns come back as JS Date objects; these fields hold a
// date only (no time), so they're normalized to "YYYY-MM-DD" strings to match
// what <input type="date"> and the JSON API contract expect.
const DATE_ONLY_FIELDS = new Set(['date', 'dueDate', 'enrolledDate']);

function normalizeRow(row) {
  if (!row) return row;
  for (const field of DATE_ONLY_FIELDS) {
    if (row[field] instanceof Date) {
      row[field] = row[field].toISOString().slice(0, 10);
    }
  }
  return row;
}

async function readTable(name) {
  const pool = await getPool();
  const result = await pool.request().query(`SELECT * FROM [dbo].[${name}] ORDER BY id`);
  return result.recordset.map(normalizeRow);
}

async function findById(name, id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, Number(id))
    .query(`SELECT * FROM [dbo].[${name}] WHERE id = @id`);
  return normalizeRow(result.recordset[0]) || null;
}

async function insert(name, record) {
  const pool = await getPool();
  const keys = Object.keys(record);
  const request = pool.request();
  keys.forEach((key) => request.input(key, record[key]));
  const columns = keys.map((key) => `[${key}]`).join(', ');
  const params = keys.map((key) => `@${key}`).join(', ');
  const result = await request.query(
    `INSERT INTO [dbo].[${name}] (${columns}) OUTPUT INSERTED.* VALUES (${params})`
  );
  return normalizeRow(result.recordset[0]);
}

async function update(name, id, patch) {
  const keys = Object.keys(patch);
  if (!keys.length) return findById(name, id);
  const pool = await getPool();
  const request = pool.request();
  request.input('id', sql.Int, Number(id));
  keys.forEach((key) => request.input(key, patch[key]));
  const setClause = keys.map((key) => `[${key}] = @${key}`).join(', ');
  const result = await request.query(
    `UPDATE [dbo].[${name}] SET ${setClause} OUTPUT INSERTED.* WHERE id = @id`
  );
  return normalizeRow(result.recordset[0]) || null;
}

async function remove(name, id) {
  const pool = await getPool();
  const result = await pool.request()
    .input('id', sql.Int, Number(id))
    .query(`DELETE FROM [dbo].[${name}] WHERE id = @id`);
  return result.rowsAffected[0] > 0;
}

module.exports = { readTable, findById, insert, update, remove };
