import type { KnowledgeBaseConfig } from '../types';

export const DEFAULT_KB_CONFIG: KnowledgeBaseConfig = {
  companyName: 'Aura Premium Essentials',
  businessHours: 'Monday to Friday, 8:00 AM – 6:00 PM (GMT+1)',
  shippingPolicy: 'Standard delivery takes 2 to 4 business days. Free shipping is provided on all orders over $50.',
  freeShippingThreshold: '$50.00',
  returnRefundPolicy: '14-day return window from receipt date. Items must be unopened and unused in original packaging. Refunds are processed within 5-7 business days upon receipt and inspection.',
  orderTrackingPolicy: 'Official tracking links are automatically emailed within 24 hours of dispatch. Real-time updates are accessible via the order portal.',
  securityGuidelines: 'NEVER request or store customer passwords, full 16-digit credit card numbers, or CVV codes. Always verify ownership using email on account or Order ID.',
  customArticles: [],
  supportedChannels: ['Live Chat', 'Call Center Transcript', 'WhatsApp', 'Email', 'Phone'],
  supportedLanguages: ['en', 'fr', 'ar', 'es'],
  sops: []
};
