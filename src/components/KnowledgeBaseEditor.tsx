import React, { useState } from 'react';
import { 
  BookOpen, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw, 
  Check, 
  Sparkles, 
  HelpCircle, 
  ShieldCheck, 
  Clock, 
  Truck, 
  RotateCw, 
  FileText,
  Play
} from 'lucide-react';
import { CustomKBArticle, KnowledgeBaseConfig, CategoryType } from '../types';
import { DEFAULT_KB_CONFIG } from '../data/initialData';

interface KnowledgeBaseEditorProps {
  kbConfig: KnowledgeBaseConfig;
  onSaveKbConfig: (config: KnowledgeBaseConfig) => void;
  onTestPolicyPrompt: (prompt: string) => void;
}

export const KnowledgeBaseEditor: React.FC<KnowledgeBaseEditorProps> = ({
  kbConfig,
  onSaveKbConfig,
  onTestPolicyPrompt
}) => {
  const [config, setConfig] = useState<KnowledgeBaseConfig>(kbConfig);
  const [isSaved, setIsSaved] = useState(false);
  const [testQuery, setTestQuery] = useState('');
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);

  // New article form state
  const [newArticleTitle, setNewArticleTitle] = useState('');
  const [newArticleCategory, setNewArticleCategory] = useState<CategoryType>('General');
  const [newArticleContent, setNewArticleContent] = useState('');
  const [newArticleTags, setNewArticleTags] = useState('');
  const [showAddArticle, setShowAddArticle] = useState(false);

  const handleSave = () => {
    onSaveKbConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_KB_CONFIG);
    onSaveKbConfig(DEFAULT_KB_CONFIG);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleAddArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newArticleTitle.trim() || !newArticleContent.trim()) return;

    const newArticle: CustomKBArticle = {
      id: `kb-custom-${Date.now()}`,
      title: newArticleTitle.trim(),
      category: newArticleCategory,
      content: newArticleContent.trim(),
      tags: newArticleTags.split(',').map(t => t.trim()).filter(Boolean),
      lastUpdated: new Date().toISOString().slice(0, 10)
    };

    const updated = {
      ...config,
      customArticles: [newArticle, ...config.customArticles]
    };

    setConfig(updated);
    onSaveKbConfig(updated);

    // Reset form
    setNewArticleTitle('');
    setNewArticleContent('');
    setNewArticleTags('');
    setShowAddArticle(false);
  };

  const handleDeleteArticle = (id: string) => {
    const updated = {
      ...config,
      customArticles: config.customArticles.filter(a => a.id !== id)
    };
    setConfig(updated);
    onSaveKbConfig(updated);
  };

  const handleRunTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testQuery.trim()) return;
    onTestPolicyPrompt(testQuery.trim());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Official Knowledge Base & Enterprise Policies
              </h1>
              <p className="text-xs text-slate-400">
                Aura strictly adheres to these ground-truth policies to eliminate hallucinations
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md shadow-indigo-950"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Policies Synced!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save & Sync AI</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Core Policy Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Brand & Core Operational Rules */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
            <Clock className="w-4 h-4 text-indigo-400" />
            1. Brand & Business Hours
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company / Brand Name:</label>
              <input
                type="text"
                value={config.companyName}
                onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Official Business Operating Hours:</label>
              <input
                type="text"
                value={config.businessHours}
                onChange={(e) => setConfig({ ...config, businessHours: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Free Shipping Order Threshold:</label>
              <input
                type="text"
                value={config.freeShippingThreshold}
                onChange={(e) => setConfig({ ...config, freeShippingThreshold: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Shipping & Delivery Policy:</label>
              <textarea
                rows={3}
                value={config.shippingPolicy}
                onChange={(e) => setConfig({ ...config, shippingPolicy: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Return, Refund & Security Policies */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
            <RotateCw className="w-4 h-4 text-emerald-400" />
            2. Returns, Refunds & Security Protocols
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Return & Refund Policy Window:</label>
              <textarea
                rows={3}
                value={config.returnRefundPolicy}
                onChange={(e) => setConfig({ ...config, returnRefundPolicy: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Order Tracking & Dispatch Updates:</label>
              <textarea
                rows={2}
                value={config.orderTrackingPolicy}
                onChange={(e) => setConfig({ ...config, orderTrackingPolicy: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center justify-between">
                <span>Security & PII Guardrails:</span>
                <span className="text-[10px] text-rose-400 font-bold uppercase">Strict Boundary</span>
              </label>
              <textarea
                rows={2}
                value={config.securityGuidelines}
                onChange={(e) => setConfig({ ...config, securityGuidelines: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 outline-none focus:border-indigo-500 resize-none font-medium leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Policy Test Sandbox */}
      <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          Test Knowledge Base in Sandbox
        </h3>
        <p className="text-xs text-slate-400 mb-3">
          Type a test question to verify how Aura resolves it against your active policies.
        </p>

        <form onSubmit={handleRunTest} className="flex gap-2">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="e.g. Can I return an item after 20 days if I opened the box?"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!testQuery.trim()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Test Query</span>
          </button>
        </form>
      </div>

      {/* Custom Knowledge Base Articles & FAQs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Additional Official Articles & FAQs ({config.customArticles.length})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Specific domain rules for warranties, international customs, subscriptions, etc.
            </p>
          </div>

          <button
            onClick={() => setShowAddArticle(!showAddArticle)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Article</span>
          </button>
        </div>

        {/* Add Article Form */}
        {showAddArticle && (
          <form onSubmit={handleAddArticle} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-white text-xs">Create New Policy Article</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Article Title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2-Year Extended Hardware Warranty"
                  value={newArticleTitle}
                  onChange={(e) => setNewArticleTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category:</label>
                <select
                  value={newArticleCategory}
                  onChange={(e) => setNewArticleCategory(e.target.value as CategoryType)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-indigo-500"
                >
                  <option value="Shipping">Shipping</option>
                  <option value="Billing">Billing</option>
                  <option value="Technical">Technical</option>
                  <option value="Account">Account</option>
                  <option value="General">General</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Policy Content:</label>
              <textarea
                required
                rows={3}
                placeholder="Exact guidelines and requirements..."
                value={newArticleContent}
                onChange={(e) => setNewArticleContent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tags (comma separated):</label>
              <input
                type="text"
                placeholder="warranty, replacement, repairs"
                value={newArticleTags}
                onChange={(e) => setNewArticleTags(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddArticle(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
              >
                Add Article
              </button>
            </div>
          </form>
        )}

        {/* Existing Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {config.customArticles.map((article) => (
            <div
              key={article.id}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60 font-mono">
                    {article.category}
                  </span>
                  <button
                    onClick={() => handleDeleteArticle(article.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                    title="Delete article"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-xs font-bold text-white mb-1.5">{article.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-3">
                  {article.content}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1 flex-wrap">
                  {article.tags.map((tag, idx) => (
                    <span key={idx} className="bg-slate-900 px-1.5 py-0.2 rounded text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
                <span>Updated: {article.lastUpdated}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
