import sql from 'mssql';

export interface SqlStatus {
  connected: boolean;
  mode: 'sqlserver' | 'local-fallback';
  message: string;
}

let sqlPool: sql.ConnectionPool | null = null;

export async function getSqlStatus(): Promise<SqlStatus> {
  const connectionString = process.env.SQL_SERVER_CONNECTION_STRING;

  if (!connectionString) {
    return {
      connected: false,
      mode: 'local-fallback',
      message: 'SQL Server connection string not configured',
    };
  }

  try {
    if (!sqlPool) {
      sqlPool = await sql.connect(connectionString);
    }

    await sqlPool.request().query('SELECT 1 AS db_ok');

    return {
      connected: true,
      mode: 'sqlserver',
      message: 'Connected to SQL Server',
    };
  } catch (error) {
    console.error('SQL Server connection failed:', error);
    return {
      connected: false,
      mode: 'local-fallback',
      message: 'SQL Server unreachable; local fallback enabled',
    };
  }
}

export async function fetchOrders(): Promise<any[]> {
  const status = await getSqlStatus();
  if (!status.connected || !sqlPool) {
    return [];
  }

  try {
    const result = await sqlPool.request().query(`SELECT TOP 100 * FROM dbo.Orders ORDER BY CreatedAt DESC`);
    return result.recordset ?? [];
  } catch (error) {
    console.error('Failed to fetch orders from SQL Server:', error);
    return [];
  }
}

export async function fetchCustomerProfile(email?: string): Promise<any | null> {
  const status = await getSqlStatus();
  if (!status.connected || !sqlPool || !email) {
    return null;
  }

  try {
    const result = await sqlPool
      .request()
      .input('email', sql.NVarChar(255), email)
      .query('SELECT TOP 1 * FROM dbo.CustomerProfiles WHERE Email = @email');

    return result.recordset?.[0] ?? null;
  } catch (error) {
    console.error('Failed to fetch customer profile from SQL Server:', error);
    return null;
  }
}

export async function fetchChatHistory(limit = 50): Promise<any[]> {
  const status = await getSqlStatus();
  if (!status.connected || !sqlPool) {
    return [];
  }

  try {
    const result = await sqlPool
      .request()
      .input('limit', sql.Int, limit)
      .query('SELECT TOP (@limit) * FROM dbo.ChatMessages ORDER BY CreatedAt DESC');

    return (result.recordset ?? []).reverse();
  } catch (error) {
    console.error('Failed to fetch chat history from SQL Server:', error);
    return [];
  }
}

export async function persistChatMessage(message: {
  sender: 'customer' | 'aura' | 'human_agent' | 'system';
  text: string;
  channel: string;
  metadata?: Record<string, unknown> | undefined;
  customerName?: string;
  customerEmail?: string;
}) {
  const status = await getSqlStatus();
  if (!status.connected || !sqlPool) {
    return { stored: false, reason: 'SQL Server offline' };
  }

  try {
    await sqlPool
      .request()
      .input('sender', sql.NVarChar(32), message.sender)
      .input('text', sql.NText, message.text)
      .input('channel', sql.NVarChar(64), message.channel)
      .input('customerName', sql.NVarChar(255), message.customerName ?? null)
      .input('customerEmail', sql.NVarChar(255), message.customerEmail ?? null)
      .input('metadata', sql.NVarChar(sql.MAX), JSON.stringify(message.metadata ?? {}))
      .query(`INSERT INTO dbo.ChatMessages (Sender, Text, Channel, CustomerName, CustomerEmail, Metadata, CreatedAt)
              VALUES (@sender, @text, @channel, @customerName, @customerEmail, @metadata, GETUTCDATE())`);

    return { stored: true, reason: 'Persisted to SQL Server' };
  } catch (error) {
    console.error('Failed to persist chat message:', error);
    return { stored: false, reason: 'Failed to persist message' };
  }
}

export async function searchKnowledgeBase(query: string): Promise<any[]> {
  const status = await getSqlStatus();
  if (!status.connected || !sqlPool || !query.trim()) {
    return [];
  }

  try {
    const result = await sqlPool
      .request()
      .input('query', sql.NVarChar(255), `%${query.trim()}%`)
      .query(`SELECT TOP 10 *
              FROM dbo.KnowledgeBaseArticles
              WHERE Title LIKE @query OR Content LIKE @query OR Tags LIKE @query
              ORDER BY UpdatedAt DESC`);

    return result.recordset ?? [];
  } catch (error) {
    console.error('Failed to query SQL knowledge base:', error);
    return [];
  }
}

export function buildEscalationSummary(args: {
  customerName?: string;
  email?: string;
  channel: string;
  issueType: string;
  sentiment: string;
  priority: string;
  summary: string;
  history: Array<{ sender: string; text: string }>; 
}) {
  const conversation = args.history
    .map((entry) => `${entry.sender.toUpperCase()}: ${entry.text}`)
    .join('\n');

  return {
    customerName: args.customerName ?? 'Unknown customer',
    email: args.email ?? 'unknown@aura.local',
    channel: args.channel,
    issueType: args.issueType,
    sentiment: args.sentiment,
    priority: args.priority,
    summary: args.summary,
    conversation,
    createdAt: new Date().toISOString(),
  };
}
