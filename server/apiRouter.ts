import express, { Request, Response } from 'express';
import { generateAuraResponse, generateAuraStream, parseDualOutput } from './geminiService';
import { buildEscalationSummary, fetchChatHistory, fetchCustomerProfile, fetchOrders, getSqlStatus, persistChatMessage, searchKnowledgeBase } from './sqlServer';

const router = express.Router();
router.use(express.json());

router.get('/status', async (_req: Request, res: Response) => {
  const status = await getSqlStatus();
  res.json({
    ...status,
    service: 'AURA Call Center API',
    timestamp: new Date().toISOString(),
  });
});

router.get('/chat/history', async (_req: Request, res: Response) => {
  const history = await fetchChatHistory();
  res.json(history);
});

router.post('/chat/message', async (req: Request, res: Response) => {
  try {
    const { conversationHistory, customerMessage, kbConfig, customerInfo, channel, language } = req.body;

    if (!customerMessage && (!conversationHistory || conversationHistory.length === 0)) {
      res.status(400).json({ error: 'Customer message is required' });
      return;
    }

    const ordersDb = await fetchOrders();
    const generated = await generateAuraResponse({
      conversationHistory: conversationHistory || [],
      customerMessage: customerMessage || '',
      kbConfig: kbConfig || {},
      knownOrders: ordersDb,
      customerInfo: customerInfo,
      language: language || 'en',
    });

    const safeMetadata: Record<string, unknown> = generated.metadata
      ? {
          category: generated.metadata.category,
          priority: generated.metadata.priority,
          sentiment: generated.metadata.sentiment,
          action_required: generated.metadata.action_required,
          confidence_score: generated.metadata.confidence_score,
          channel: channel || 'Live Chat',
        }
      : {};

    if (customerInfo?.email) {
      const crmProfile = await fetchCustomerProfile(customerInfo.email);
      if (crmProfile) {
        generated.customerProfile = crmProfile;
      }
    }

    await persistChatMessage({
      sender: 'customer',
      text: customerMessage || '',
      channel: channel || 'Live Chat',
      customerName: customerInfo?.name,
      customerEmail: customerInfo?.email,
      metadata: safeMetadata,
    });

    await persistChatMessage({
      sender: 'aura',
      text: generated.customerResponse || generated.rawText || '',
      channel: channel || 'Live Chat',
      customerName: customerInfo?.name,
      customerEmail: customerInfo?.email,
      metadata: safeMetadata,
    });

    res.json(generated);
  } catch (error: any) {
    console.error('Error generating Aura response:', error);
    res.status(500).json({
      error: error.message || 'Internal server error processing AI response',
      details: String(error),
    });
  }
});

router.post('/chat/stream', async (req: Request, res: Response) => {
  try {
    const { conversationHistory, customerMessage, kbConfig, customerInfo } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const ordersDb = await fetchOrders();
    const stream = generateAuraStream({
      conversationHistory: conversationHistory || [],
      customerMessage: customerMessage || '',
      kbConfig: kbConfig || {},
      knownOrders: ordersDb,
      customerInfo: customerInfo,
    });

    let fullText = '';
    for await (const chunk of stream) {
      fullText += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    const parsed = parseDualOutput(fullText);
    res.write(`data: ${JSON.stringify({ done: true, fullText, parsed })}\n\n`);
    res.end();
  } catch (error: any) {
    console.error('Error streaming Aura response:', error);
    res.write(`data: ${JSON.stringify({ error: error.message || 'Streaming failed' })}\n\n`);
    res.end();
  }
});

router.get('/orders', async (_req: Request, res: Response) => {
  const orders = await fetchOrders();
  res.json(orders);
});

router.get('/orders/:id', async (req: Request, res: Response) => {
  const query = req.params.id.toUpperCase();
  const orders = await fetchOrders();
  const order = orders.find((o: any) => o.orderId.toUpperCase() === query || o.trackingNumber.toUpperCase() === query);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(order);
});

router.get('/customers/:email', async (req: Request, res: Response) => {
  const customer = await fetchCustomerProfile(req.params.email);
  if (!customer) {
    res.status(404).json({ error: 'Customer profile not found' });
    return;
  }
  res.json(customer);
});

router.get('/knowledge-base/search', async (req: Request, res: Response) => {
  const query = String(req.query.q || '');
  if (!query.trim()) {
    res.json([]);
    return;
  }

  const result = await searchKnowledgeBase(query);
  res.json(result);
});

router.post('/handoff/escalate', async (req: Request, res: Response) => {
  const summary = buildEscalationSummary({
    customerName: req.body.customerName,
    email: req.body.email,
    channel: req.body.channel || 'Live Chat',
    issueType: req.body.issueType || 'General support',
    sentiment: req.body.sentiment || 'Neutral',
    priority: req.body.priority || 'Medium',
    summary: req.body.summary || 'Manual escalation requested by agent.',
    history: req.body.history || [],
  });

  res.json({
    success: true,
    message: 'Case transferred to a human specialist',
    handoff: summary,
  });
});

router.get('/health', async (_req: Request, res: Response) => {
  const status = await getSqlStatus();
  res.json({
    status: status.connected ? 'healthy' : 'degraded',
    service: 'AURA Call Center API',
    database: status,
    version: '1.1.0',
    timestamp: new Date().toISOString(),
  });
});

export default router;
