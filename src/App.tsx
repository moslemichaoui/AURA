import { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, BookOpen, Database, Inbox, Menu, MessageSquareText, Search, ShieldCheck, Sparkles, X } from 'lucide-react';
import { CustomerChat } from './components/CustomerChat';
import { OpsDashboard } from './components/OpsDashboard';
import { TicketsQueue } from './components/TicketsQueue';
import { KnowledgeBaseEditor } from './components/KnowledgeBaseEditor';
import { AnalyticsView } from './components/AnalyticsView';
import { OrderLookupModal } from './components/OrderLookupModal';
import { ChannelSelector } from './components/ChannelSelector';
import { CustomerInfoPanel } from './components/CustomerInfoPanel';
import { SentimentMeter } from './components/SentimentMeter';
import { DEFAULT_KB_CONFIG } from './data/initialData';
import type { ActiveTab } from './components/Navbar';
import type { ChatMessage, CRMCustomerProfile, CustomerPersona, KnowledgeBaseConfig, OrderRecord, TicketMetadata, TicketRecord, ChannelType, LanguageCode } from './types';

const padTime = (value: number) => String(value).padStart(2, '0');

const quickQueries = [
  { label: 'Track an order', query: 'I need help checking the live status of an order and the best next step.' },
  { label: 'Return policy', query: 'What is the current return policy and how do I request a return or refund?' },
  { label: 'Shipping rules', query: 'What are the shipping rules and free shipping threshold for this account?' },
  { label: 'Account security', query: 'I need to reset access safely and confirm the secure verification steps.' },
  { label: 'Escalate for a specialist', query: 'This issue needs a human specialist and a full written summary of the problem.' },
];

const getCurrentTimeStamp = () => {
  const now = new Date();
  return `${padTime(now.getHours())}:${padTime(now.getMinutes())}`;
};

const detectMessageLanguage = (input: string): LanguageCode => {
  const normalized = input.toLowerCase();

  if (/[àâçéèêëîïôûùüÿœæñ]/.test(input) || /\b(bonjour|salut|merci|commande|livraison|retour|remboursement|ticket|s'il vous plaît|délai|réponse|réclamation|garantie|retourner)\b/.test(normalized)) {
    return 'fr';
  }

  if (/[\u0600-\u06FF]/.test(input) || /\b(salam|marhba|3asslama|3aychek|mte3|mta3|wakt|kolchi|besh|y3ni|wajeb|flous|traj|taw|el|ma3ana|statu)\b/.test(normalized)) {
    return 'ar';
  }

  return 'en';
};

const getInitialAiMessage = (): ChatMessage => ({
  id: 'welcome-aura',
  sender: 'aura',
  text: 'Hi there — I’m Aura, your live support agent. I can help with order status, returns, shipping, account access, and escalation requests. How can I help today?',
  timestamp: getCurrentTimeStamp(),
  metadata: {
    category: 'General',
    priority: 'Medium',
    sentiment: 'Neutral',
    action_required: 'Awaiting Customer Reply',
    confidence_score: '0.93',
  },
});

const createEscalationCard = (issueText: string, metadata?: TicketMetadata, customerName?: string, email?: string, symbol?: string): string => {
  const urgency = metadata?.priority ?? 'Medium';
  const intent = metadata?.category ?? 'General';
  const sentiment = metadata?.sentiment ?? 'Neutral';
  const issue = issueText.replace(/\s+/g, ' ').trim().slice(0, 220) || 'Customer requested human review';

  return [
    '### Human escalation summary',
    `**Customer:** ${customerName ?? 'Customer'}`,
    `**Intent:** ${intent}`,
    `**Urgency Level:** ${urgency}`,
    `**Key Issue:** ${issue}`,
    `**Sentiment:** ${sentiment}`,
    `**Customer Email:** ${email ?? 'unknown@aura.local'}`,
    '',
    '**Interaction Log**',
    `- AURA assessed the request and flagged a human handoff for priority review.`,
    `- ${symbol ?? 'Escalation'} initiated from the live support channel.`,
    `- Next agent should continue from the latest customer and AURA messages without reasking the same questions.`,
  ].join('\n');
};

const detectMessageIntent = (input: string): ChatMessage['messageType'] => {
  const normalized = input.toLowerCase();

  if (/(where is my order|order status|track.*order|tracking|delivery|in transit|shipped|AUR-\d{4})/.test(normalized)) {
    return 'order';
  }

  if (/(return policy|refund|return|policy|faq)/.test(normalized)) {
    return 'faq';
  }

  if (/(broken|faulty|damaged|damaged|defective|not working|issue|problem|troubleshooting|product is broken)/.test(normalized)) {
    return 'troubleshooting';
  }

  return 'general';
};

const buildAiReply = (input: string, companyName: string, orderList: OrderRecord[] = []): string => {
  const normalized = input.toLowerCase();
  const orderMatch = input.match(/#?AUR-\d{4}/i);
  const matchedOrder = orderMatch
    ? orderList.find((order) => order.orderId.toUpperCase() === orderMatch[0].replace('#', '').toUpperCase())
    : undefined;

  if (normalized.includes('order') || normalized.includes('tracking') || normalized.includes('delivery') || !!matchedOrder) {
    const timeline = matchedOrder ? [
      `- Shipped — ${matchedOrder.carrier} picked up the parcel`,
      `- In Transit — the parcel is moving toward the destination`,
      `- Delivered — estimated ${matchedOrder.estimatedDelivery}`,
    ] : [
      '- Shipped — your order has left the fulfillment center',
      '- In Transit — the parcel is moving to the destination',
      '- Delivered — delivery window is available in the tracking portal',
    ];

    return [
      '### Order update',
      matchedOrder ? `I found **${matchedOrder.orderId}** in the live shipping feed.` : 'I can trace that immediately and keep the next step clear.',
      `**Current status:** ${matchedOrder?.status ?? 'In Transit'}`,
      `**Carrier:** ${matchedOrder?.carrier ?? 'Premium Courier'}`,
      `**Estimated delivery:** ${matchedOrder?.estimatedDelivery ?? 'Tomorrow by 6:00 PM'}`,
      '',
      '**Timeline**',
      ...timeline,
      '',
      `[Track shipment](https://www.example.com/track/${matchedOrder?.orderId ?? 'AUR-8921'})`,
      '',
      `${companyName} keeps order status synchronized so I can confirm the best next step for replacement, delay support, or return review.`,
    ].join('\n');
  }

  if (normalized.includes('return') || normalized.includes('refund') || normalized.includes('policy')) {
    return [
      '### Return policy',
      '- Returns are accepted within 30 days of delivery for eligible items in original condition.',
      '- Refunds are issued to the original payment method after the return is approved and inspected.',
      '- Final sale or personalized items may not qualify, and shipping fees are non-refundable unless we shipped the wrong item.',
      '',
      '[View the full return policy](https://www.example.com/returns-policy)',
    ].join('\n');
  }

  if (normalized.includes('shipping') || normalized.includes('free shipping') || normalized.includes('threshold')) {
    return [
      '### Shipping details',
      '- Free standard shipping is available on orders over $75.',
      '- Express delivery is available for eligible items with a faster carrier SLA.',
      '- International shipping and duties follow the billing destination and customs rules.',
      '',
      '[Review shipping rules](https://www.example.com/shipping-policy)',
    ].join('\n');
  }

  if (normalized.includes('2fa') || normalized.includes('login') || normalized.includes('password') || normalized.includes('account')) {
    return [
      '### Secure account access',
      '- I can guide the verification flow without asking for sensitive credentials.',
      '- If the issue is high-risk or the account is blocked, I can escalate immediately with a written summary.',
      '- Verification may require checking the registered email or last delivery address on file.',
      '',
      '[View account security guidance](https://www.example.com/security-policy)',
    ].join('\n');
  }

  if (normalized.includes('broken') || normalized.includes('faulty') || normalized.includes('damaged') || normalized.includes('defective') || normalized.includes('not working') || normalized.includes('issue') || normalized.includes('problem')) {
    return [
      'I’m sorry you’re dealing with a faulty item. I want to fix this as quickly and clearly as possible.',
      '',
      '### Quick troubleshooting checklist',
      '1. Confirm the item is within the warranty or return window and check the powered state or setup instructions.',
      '2. Take a photo of the item, packaging, and any error message so the case is documented clearly.',
      '3. Try a clean reset, re-pair, or switch of the power source before escalating the issue.',
      '4. Tell me whether the problem is consistent or happens only after setup, charging, or use.',
      '',
      'If the issue continues after those checks, I can create a human escalation with the exact details you share so the next agent does not have to restart the process.',
      '',
      '[Contact support for a live review](https://www.example.com/support)',
    ].join('\n');
  }

  return `Thanks for reaching out. I’ve checked the live policy layer and can help with the order, shipping, refund, or account path you need. If you share a bit more detail, I can prepare the right next action or route it to a human specialist.`;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [currentChannel, setCurrentChannel] = useState<ChannelType>('Live Chat');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [kbConfig, setKbConfig] = useState<KnowledgeBaseConfig>(DEFAULT_KB_CONFIG);
  const [selectedPersona, setSelectedPersona] = useState<CustomerPersona | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; mode: string; message: string }>({
    connected: false,
    mode: 'local-fallback',
    message: 'Checking SQL Server status...',
  });
  const [customerProfile, setCustomerProfile] = useState<CRMCustomerProfile | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>('en');
  const [manualLanguage, setManualLanguage] = useState<LanguageCode | null>(null);

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        const statusResponse = await fetch('/api/status');
        if (statusResponse.ok) {
          const status = await statusResponse.json();
          setDbStatus({
            connected: Boolean(status.connected),
            mode: status.mode || 'local-fallback',
            message: status.message || 'Live database status unknown',
          });
        }

        const historyResponse = await fetch('/api/messages');
        if (historyResponse.ok) {
          const history = (await historyResponse.json()) as ChatMessage[];
          setMessages(history.length ? history : []);
        } else {
          const legacyHistoryResponse = await fetch('/api/chat/history');
          if (legacyHistoryResponse.ok) {
            const history = (await legacyHistoryResponse.json()) as ChatMessage[];
            setMessages(history.length ? history : []);
          } else {
            setMessages([]);
          }
        }

        const ordersResponse = await fetch('/api/orders');
        if (ordersResponse.ok) {
          const fetchedOrders = (await ordersResponse.json()) as OrderRecord[];
          setOrders(fetchedOrders);
        }
      } catch (error) {
        console.error('Failed to load live support workspace:', error);
        setDbStatus({ connected: false, mode: 'local-fallback', message: 'SQL Server unreachable; local fallback enabled' });
        setMessages([]);
      }
    };

    void loadWorkspace();
  }, []);

  const latestMetadata = useMemo<TicketMetadata | null>(() => {
    const match = [...messages].reverse().find((message) => message.metadata);
    return match?.metadata ?? null;
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) {
      return;
    }

    const normalizedText = text.trim();
    const detectedLanguage = manualLanguage ?? detectMessageLanguage(normalizedText);
    const resolvedLanguage = detectedLanguage;
    setActiveLanguage(resolvedLanguage);

    const customerMessage: ChatMessage = {
      id: `customer-${Date.now()}`,
      sender: 'customer',
      text: normalizedText,
      timestamp: getCurrentTimeStamp(),
    };

    const historyForApi = messages.map((message) => ({
      role: message.sender === 'customer' ? 'user' : 'model',
      text: message.text,
    }));

    setMessages((previous) => [...previous, customerMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationHistory: historyForApi,
          customerMessage: normalizedText,
          kbConfig,
          channel: currentChannel,
          language: resolvedLanguage,
          customerInfo: {
            name: selectedPersona?.name,
            email: selectedPersona?.email,
            orderId: selectedPersona?.orderId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = (await response.json()) as {
        customerResponse?: string;
        metadata?: TicketMetadata;
        rawText?: string;
        error?: string;
        customerProfile?: CRMCustomerProfile | null;
      };

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.customerProfile) {
        setCustomerProfile(data.customerProfile);
      }

      const assistantReply = data.customerResponse || data.rawText || buildAiReply(normalizedText, kbConfig.companyName, orders);

      const assistantMessage: ChatMessage = {
        id: `aura-${Date.now()}`,
        sender: 'aura',
        text: assistantReply,
        timestamp: getCurrentTimeStamp(),
        messageType: detectMessageIntent(normalizedText),
        metadata: data.metadata || {
          category: 'General',
          priority: 'Medium',
          sentiment: 'Neutral',
          action_required: 'Awaiting Customer Reply',
          confidence_score: '0.93',
        },
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      console.error('Failed to fetch Aura response:', error);
      setMessages((previous) => [
        ...previous,
        {
          id: `aura-fallback-${Date.now()}`,
          sender: 'aura',
          text: buildAiReply(normalizedText, kbConfig.companyName, orders),
          timestamp: getCurrentTimeStamp(),
          messageType: detectMessageIntent(normalizedText),
          metadata: {
            category: normalizedText.toLowerCase().includes('return') ? 'Billing' : normalizedText.toLowerCase().includes('login') || normalizedText.toLowerCase().includes('2fa') ? 'Technical' : normalizedText.toLowerCase().includes('shipping') ? 'Shipping' : 'General',
            priority: normalizedText.toLowerCase().includes('urgent') || normalizedText.toLowerCase().includes('flight') ? 'Urgent' : 'Medium',
            sentiment: normalizedText.toLowerCase().includes('angry') || normalizedText.toLowerCase().includes('frustrated') ? 'Frustrated' : 'Neutral',
            action_required: 'Awaiting Customer Reply',
            confidence_score: '0.93',
          },
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPersona = (persona: CustomerPersona) => {
    setSelectedPersona(persona);
    setCustomerProfile(persona.crmProfile ?? null);
  };

  const handleResetChat = () => {
    setMessages([]);
    setCustomerProfile(null);
    setSelectedPersona(null);
    setManualLanguage(null);
    setActiveLanguage('en');
  };

  const handleOrderSelectInChat = (order: OrderRecord) => {
    const orderText = `Hi Aura, I’m checking order #${order.orderId}. Can you confirm the status and next steps for this shipment?`;
    setActiveTab('chat');
    setMessages((previous) => [
      ...previous,
      {
        id: `order-check-${Date.now()}`,
        sender: 'customer',
        text: orderText,
        timestamp: getCurrentTimeStamp(),
      },
      {
        id: `order-reply-${Date.now()}`,
        sender: 'aura',
        text: [
          '### Order update',
          `I found **#${order.orderId}** in the live shipping feed.`,
          `**Current status:** ${order.status}`,
          `**Carrier:** ${order.carrier}`,
          `**Estimated delivery:** ${order.estimatedDelivery}`,
          '',
          '**Timeline**',
          '- Shipped — parcel was packed and released to the courier',
          '- In Transit — package is currently moving toward the destination',
          '- Delivered — expected arrival by the promised window',
          '',
          `[Track shipment](https://www.example.com/track/${order.orderId})`,
        ].join('\n'),
        timestamp: getCurrentTimeStamp(),
        messageType: 'order',
        metadata: {
          category: 'Shipping',
          priority: order.status === 'Delivered' ? 'Medium' : 'High',
          sentiment: 'Neutral',
          action_required: 'Awaiting Customer Reply',
          confidence_score: '0.97',
        },
      },
    ]);
  };

  const handleEscalate = (reason?: string) => {
    const customerDetails = selectedPersona ?? {
      id: 'customer-unknown',
      name: 'Customer',
      tag: 'Live',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      email: 'unknown@aura.local',
      scenarioTitle: 'Support request',
      description: 'Customer requiring human review',
      initialMessage: 'Need help',
      language: 'en',
    };

    const summaryText = createEscalationCard(
      reason ?? 'Customer requested human review after AURA assessed the issue and recommended handoff.',
      latestMetadata ?? {
        category: 'General',
        priority: 'High',
        sentiment: 'Neutral',
        action_required: 'Escalate to Human',
        confidence_score: '0.94',
      },
      customerDetails.name,
      customerDetails.email,
      'Escalation'
    );

    setMessages((previous) => [
      ...previous,
      {
        id: `system-escalation-${Date.now()}`,
        sender: 'system',
        text: summaryText,
        timestamp: getCurrentTimeStamp(),
        metadata: {
          category: 'General',
          priority: 'High',
          sentiment: 'Neutral',
          action_required: 'Escalate to Human',
          confidence_score: '0.94',
        },
      },
    ]);

    setTickets((previous) => [
      ...previous,
      {
        id: `ticket-${Date.now()}`,
        customerName: customerDetails.name,
        customerEmail: customerDetails.email,
        customerAvatar: customerDetails.avatar,
        subject: 'Escalated support case',
        category: 'General',
        priority: 'High',
        sentiment: 'Neutral',
        actionRequired: 'Escalate to Human',
        confidenceScore: 0.94,
        status: 'Escalated',
        messages: messages.slice(-4),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        internalNotes: [reason ?? 'Escalated to human specialist for manual review.'],
        language: 'en',
        channel: currentChannel,
      },
    ]);
  };

  const handleRefund = (orderId: string) => {
    setTickets((previous) => [
      ...previous,
      {
        id: `ticket-${Date.now()}`,
        customerName: selectedPersona?.name ?? 'Customer',
        customerEmail: selectedPersona?.email ?? 'unknown@aura.local',
        customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        orderId,
        subject: `Refund request for ${orderId}`,
        category: 'Billing',
        priority: 'High',
        sentiment: 'Neutral',
        actionRequired: 'Refund Requested',
        confidenceScore: 0.9,
        status: 'Refund Requested',
        messages: messages.slice(-2),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        internalNotes: ['Refund workflow started.'],
        language: 'en',
        channel: currentChannel,
      },
    ]);
  };

  const handleAddInternalNote = (note: string) => {
    setTickets((previous) =>
      previous.map((ticket, index) =>
        index === previous.length - 1
          ? { ...ticket, internalNotes: [...ticket.internalNotes, note], updatedAt: new Date().toISOString() }
          : ticket,
      ),
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <CustomerChat
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            kbConfig={kbConfig}
            selectedPersona={selectedPersona}
            onSelectPersona={handleSelectPersona}
            personas={[]}
            activeLanguage={activeLanguage}
            onLanguageChange={(language: LanguageCode) => {
              setManualLanguage(language);
              setActiveLanguage(language);
            }}
            onEscalateToHuman={(issueText: string, metadata?: TicketMetadata) => {
              handleEscalate(`${issueText || 'Customer requested human review'}\n\n${metadata ? `Category: ${metadata.category}; Priority: ${metadata.priority}; Sentiment: ${metadata.sentiment}` : ''}`);
            }}
            onOrderClick={(orderId: string) => {
              void orderId;
              setIsOrderLookupOpen(true);
            }}
            onResetChat={handleResetChat}
            orders={orders}
          />
        );
      case 'ops':
        return (
          <OpsDashboard
            messages={messages}
            currentMetadata={latestMetadata}
            kbConfig={kbConfig}
            onEscalate={handleEscalate}
            onRefund={handleRefund}
            onAddInternalNote={handleAddInternalNote}
            onOrderClick={(orderId: string) => {
              void orderId;
              setIsOrderLookupOpen(true);
            }}
            orders={orders}
          />
        );
      case 'tickets':
        return (
          <TicketsQueue
            tickets={tickets}
            onSelectTicket={() => undefined}
            onResolveTicket={(ticketId: string) =>
              setTickets((previous) =>
                previous.map((ticket) =>
                  ticket.id === ticketId
                    ? { ...ticket, status: 'Resolved', actionRequired: 'Resolved', updatedAt: new Date().toISOString().slice(0, 16) }
                    : ticket,
                ),
              )
            }
            onEscalateTicket={(ticketId: string) =>
              setTickets((previous) =>
                previous.map((ticket) =>
                  ticket.id === ticketId
                    ? { ...ticket, status: 'Escalated', actionRequired: 'Escalate to Human', updatedAt: new Date().toISOString().slice(0, 16) }
                    : ticket,
                ),
              )
            }
            onSendHumanReply={() => undefined}
            onRefundTicket={(ticketId: string) =>
              setTickets((previous) =>
                previous.map((ticket) =>
                  ticket.id === ticketId
                    ? { ...ticket, status: 'Refund Requested', actionRequired: 'Refund Requested', updatedAt: new Date().toISOString().slice(0, 16) }
                    : ticket,
                ),
              )
            }
            onOrderClick={(orderId: string) => {
              void orderId;
              setIsOrderLookupOpen(true);
            }}
            orders={orders}
          />
        );
      case 'kb':
        return (
          <KnowledgeBaseEditor
            kbConfig={kbConfig}
            onSaveKbConfig={setKbConfig}
            onTestPolicyPrompt={(prompt: string) => {
              setActiveTab('chat');
              void handleSendMessage(prompt);
            }}
          />
        );
      case 'analytics':
        return <AnalyticsView tickets={tickets} companyName={kbConfig.companyName} />;
      default:
        return null;
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: typeof MessageSquareText }[] = [
    { id: 'chat', label: 'Live Chat', icon: MessageSquareText },
    { id: 'ops', label: 'Dual Inspector', icon: Activity },
    { id: 'tickets', label: 'Tickets Queue', icon: Inbox },
    { id: 'kb', label: 'Knowledge Base', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#f6f2ed] text-[#2f2a24]">
      <div className="relative flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[310px] border-r border-[#d9c4a7] bg-[#f7f2eb] shadow-[12px_0_30px_rgba(47,42,36,0.08)] transition-transform duration-300 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between border-b border-[#e4d7c5] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6d976d] to-[#51683d] text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b6853]">AURA</p>
                <h2 className="text-sm font-bold text-[#2b241f]">Support Console</h2>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#dcc8a7] bg-[#f2e9dd] text-[#3d342d] transition-colors hover:bg-[#eadfc8]"
              aria-label="Close navigation drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-5 px-4 py-5">
            <div>
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7b6853]">Workspace</p>
              <div className="space-y-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                        isActive
                          ? 'border-[#b3c8a1] bg-[#edf4e4] text-[#2f3f2d]'
                          : 'border-transparent bg-transparent text-[#5b5048] hover:bg-[#f0e7d7] hover:text-[#2b241f]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-[#e4d7c5] bg-[#f3ebdd] p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7b6853]">Operations</p>
              <div className="mt-3 space-y-2 text-xs text-[#564d45]">
                <div className="flex items-center justify-between">
                  <span>Live queue</span>
                  <span className="font-semibold text-[#51683d]">{tickets.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Database</span>
                  <span className="font-semibold text-[#51683d]">{dbStatus.connected ? 'Live' : 'Fallback'}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {isSidebarOpen && (
          <button type="button" className="fixed inset-0 z-30 bg-[#2f2a24]/20 backdrop-blur-[1px]" aria-label="Close drawer overlay" onClick={() => setIsSidebarOpen(false)} />
        )}

        <div className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:pl-[310px]' : ''}`}>
          <header className="sticky top-0 z-20 border-b border-[#d6c7ae]/80 bg-[#f4efe7]/90 backdrop-blur-md shadow-[0_1px_0_rgba(98,84,66,0.08)]">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen((open) => !open)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#d9c4a7] bg-[#f2e9dd] text-[#3d342d] shadow-sm transition-colors hover:bg-[#eadfc8]"
                  aria-label="Open navigation drawer"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div className="hidden items-center gap-3 sm:flex">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#6d976d] to-[#51683d] text-sm font-bold text-white shadow-sm">
                    A
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7b6853]">AI Support</p>
                    <h1 className="text-sm font-bold text-[#2b241f]">Aura</h1>
                  </div>
                </div>
              </div>

              <div className="hidden flex-1 items-center justify-center md:flex">
                <ChannelSelector currentChannel={currentChannel} onChannelChange={setCurrentChannel} />
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                    dbStatus.connected
                      ? 'border-[#a6c087] bg-[#edf5e7] text-[#406039]'
                      : 'border-[#e8c9a0] bg-[#f6eddc] text-[#7d5d2a]'
                  }`}
                >
                  <Database className="h-3 w-3" />
                  {dbStatus.connected ? '✓ Connected to SQL Server' : dbStatus.message}
                </span>
                <button
                  type="button"
                  onClick={() => setIsOrderLookupOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#51683d] px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-[#c7d4b9] transition-colors hover:bg-[#425532]"
                >
                  <Search className="h-3.5 w-3.5" />
                  <span>Order Lookup</span>
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">{renderActiveTab()}</main>
        </div>
      </div>

      <OrderLookupModal
        isOpen={isOrderLookupOpen}
        onClose={() => setIsOrderLookupOpen(false)}
        orders={orders}
        onOrderSelectInChat={handleOrderSelectInChat}
        onIssueRefund={(orderId: string) => handleRefund(orderId)}
      />
    </div>
  );
}

