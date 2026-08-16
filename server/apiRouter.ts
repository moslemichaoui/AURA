import express, { Request, Response } from 'express';
import { generateAuraResponse, generateAuraStream, parseDualOutput } from './geminiService';
import { MOCK_ORDERS } from '../src/data/initialData';
import { OrderRecord } from '../src/types';

const router = express.Router();
router.use(express.json());

// In-memory orders store for simulation
let ordersDb: OrderRecord[] = [...MOCK_ORDERS];

// 1. Standard Chat Message Endpoint
router.post('/chat/message', async (req: Request, res: Response) => {
  try {
    const { conversationHistory, customerMessage, kbConfig, customerInfo } = req.body;

    if (!customerMessage && (!conversationHistory || conversationHistory.length === 0)) {
      res.status(400).json({ error: 'Customer message is required' });
      return;
    }

    const result = await generateAuraResponse({
      conversationHistory: conversationHistory || [],
      customerMessage: customerMessage || '',
      kbConfig: kbConfig || {},
      knownOrders: ordersDb,
      customerInfo: customerInfo
    });

    res.json(result);
  } catch (error: any) {
    console.error('Error generating Aura response:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error processing AI response',
      details: String(error)
    });
  }
});

// 2. Streaming Chat Message Endpoint (SSE)
router.post('/chat/stream', async (req: Request, res: Response) => {
  try {
    const { conversationHistory, customerMessage, kbConfig, customerInfo } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = generateAuraStream({
      conversationHistory: conversationHistory || [],
      customerMessage: customerMessage || '',
      kbConfig: kbConfig || {},
      knownOrders: ordersDb,
      customerInfo: customerInfo
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

// 3. Simulated Orders Lookup & Management
router.get('/orders', (req: Request, res: Response) => {
  res.json(ordersDb);
});

router.get('/orders/:id', (req: Request, res: Response) => {
  const query = req.params.id.toUpperCase();
  const order = ordersDb.find(o => o.orderId.toUpperCase() === query || o.trackingNumber.toUpperCase() === query);
  if (!order) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }
  res.json(order);
});

router.post('/orders/:id/refund', (req: Request, res: Response) => {
  const query = req.params.id.toUpperCase();
  const index = ordersDb.findIndex(o => o.orderId.toUpperCase() === query);
  if (index === -1) {
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  ordersDb[index] = {
    ...ordersDb[index],
    status: 'Refunded',
    refundProcessed: true,
    refundAmount: ordersDb[index].total
  };

  res.json({ success: true, order: ordersDb[index] });
});

export default router;
