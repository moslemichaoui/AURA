export type CategoryType = 'Shipping' | 'Billing' | 'Account' | 'Technical' | 'General';

export type PriorityType = 'Low' | 'Medium' | 'High' | 'Urgent';

export type SentimentType = 'Positive' | 'Neutral' | 'Negative' | 'Frustrated';

export type ActionRequiredType = 
  | 'Awaiting Customer Reply'
  | 'Escalate to Human'
  | 'Resolved'
  | 'Refund Requested';

export interface TicketMetadata {
  category: CategoryType;
  priority: PriorityType;
  sentiment: SentimentType;
  action_required: ActionRequiredType;
  confidence_score: string; // e.g. "0.95"
}

export interface GuardrailCheckResult {
  piiClean: boolean;
  strictBoundariesPassed: boolean;
  empathyDetected: boolean;
  noHallucinationVerified: boolean;
  languageDetected: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'aura' | 'human_agent' | 'system';
  text: string;
  timestamp: string;
  metadata?: TicketMetadata;
  rawResponse?: string;
  guardrails?: GuardrailCheckResult;
  orderReference?: string;
  isStreaming?: boolean;
  feedback?: {
    rating: number;
    comment?: string;
  };
}

export interface CustomKBArticle {
  id: string;
  title: string;
  category: CategoryType;
  content: string;
  tags: string[];
  lastUpdated: string;
}

export interface KnowledgeBaseConfig {
  companyName: string;
  businessHours: string;
  shippingPolicy: string;
  freeShippingThreshold: string;
  returnRefundPolicy: string;
  orderTrackingPolicy: string;
  securityGuidelines: string;
  customArticles: CustomKBArticle[];
}

export interface OrderItem {
  id: string;
  name: string;
  qty: number;
  price: number;
  image?: string;
}

export interface OrderRecord {
  orderId: string;
  customerName: string;
  customerEmail: string;
  datePlaced: string;
  status: 'Order Placed' | 'Processing' | 'Shipped' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Returned' | 'Refunded';
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingAddress: string;
  eligibleForRefund: boolean;
  refundProcessed?: boolean;
  refundAmount?: number;
}

export interface CustomerPersona {
  id: string;
  name: string;
  tag: string;
  avatar: string;
  email: string;
  scenarioTitle: string;
  description: string;
  initialMessage: string;
  language: 'en' | 'fr' | 'ar_derja' | 'es' | 'de';
  orderId?: string;
}

export interface TicketRecord {
  id: string;
  customerName: string;
  customerEmail: string;
  customerAvatar: string;
  orderId?: string;
  subject: string;
  category: CategoryType;
  priority: PriorityType;
  sentiment: SentimentType;
  actionRequired: ActionRequiredType;
  confidenceScore: number;
  status: 'Open' | 'Escalated' | 'Resolved' | 'Refund Requested' | 'Awaiting Reply';
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  csatScore?: number;
  internalNotes: string[];
  assignedAgent?: string;
  language: string;
}

export interface SystemStats {
  totalInquiries: number;
  avgResolutionTime: string;
  csatAverage: number;
  escalationRate: string;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
    frustrated: number;
  };
  categoryBreakdown: {
    shipping: number;
    billing: number;
    account: number;
    technical: number;
    general: number;
  };
  guardrailCompliance: number;
}
