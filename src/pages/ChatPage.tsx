import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Send, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  Check, 
  Copy, 
  RotateCw, 
  AlertTriangle, 
  Sparkles, 
  PhoneCall, 
  Stethoscope, 
  Search, 
  Menu, 
  X,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { api } from '../api/client';
import { Conversation, ChatMessage } from '../types';

export const ChatPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestedPrompts = [
    'Can you help me understand my symptoms?',
    'What should I know about this medication and food interactions?',
    'What specific questions should I write down for my doctor?',
    'Help me understand my routine lab test results.',
  ];

  // Fetch list of conversations
  const fetchConversations = async () => {
    try {
      const data = await api.get<Conversation[]>('/conversations');
      setConversations(data);
      return data;
    } catch (err) {
      console.error('Failed to load conversations:', err);
      return [];
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      const list = await fetchConversations();
      if (conversationId) {
        loadConversation(conversationId);
      } else if (list.length > 0) {
        // Navigate to the most recent conversation or stay on fresh chat
        loadConversation(list[0].id);
      }
    };
    init();
  }, [conversationId]);

  // Load single conversation
  const loadConversation = async (id: string) => {
    try {
      setErrorMessage(null);
      const data = await api.get<Conversation>(`/conversations/${id}`);
      setCurrentConversation(data);
    } catch (err: any) {
      console.error('Failed to load conversation:', err);
      setErrorMessage('Could not open conversation. Creating a new one.');
      handleNewConversation();
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, isSending]);

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await api.post<Conversation>('/conversations', { title: 'New Health Consultation' });
      setConversations(prev => [newConv, ...prev]);
      setCurrentConversation(newConv);
      navigate(`/chat/${newConv.id}`, { replace: true });
      setMobileHistoryOpen(false);
    } catch (err) {
      console.error('Failed to create new conversation:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    let targetConv = currentConversation;

    // If no active conversation, create one first
    if (!targetConv) {
      try {
        targetConv = await api.post<Conversation>('/conversations', {
          title: text.slice(0, 40) + '...',
        });
        setConversations(prev => [targetConv!, ...prev]);
        setCurrentConversation(targetConv);
        navigate(`/chat/${targetConv.id}`, { replace: true });
      } catch (err) {
        console.error('Failed to create initial conversation:', err);
        return;
      }
    }

    // Optimistically show user message
    const tempUserMsg: ChatMessage = {
      id: 'temp_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setCurrentConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, tempUserMsg],
    } : null);

    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      const response = await api.post<{
        conversation: Conversation;
        userMessage: ChatMessage;
        assistantMessage: ChatMessage;
      }>(`/conversations/${targetConv.id}/messages`, { content: text });

      setCurrentConversation(response.conversation);
      // Update list
      setConversations(prev =>
        prev.map(c => c.id === response.conversation.id ? response.conversation : c)
      );
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setErrorMessage(err.message || 'Error receiving assistant response. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleRename = async (id: string) => {
    if (!newTitle.trim()) {
      setEditingTitleId(null);
      return;
    }
    try {
      const updated = await api.patch<Conversation>(`/conversations/${id}`, { title: newTitle.trim() });
      setConversations(prev => prev.map(c => c.id === id ? updated : c));
      if (currentConversation?.id === id) {
        setCurrentConversation(updated);
      }
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    } finally {
      setEditingTitleId(null);
      setNewTitle('');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation record?')) return;
    try {
      await api.delete(`/conversations/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (currentConversation?.id === id) {
        const remaining = conversations.filter(c => c.id !== id);
        if (remaining.length > 0) {
          loadConversation(remaining[0].id);
          navigate(`/chat/${remaining[0].id}`, { replace: true });
        } else {
          setCurrentConversation(null);
          navigate('/chat', { replace: true });
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-slate-50 overflow-hidden text-left">
      
      {/* 1. Left Sidebar: Conversation History Drawer */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 md:static md:translate-x-0
        ${mobileHistoryOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Top Header of Sidebar */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={handleNewConversation}
            className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Health Consultation</span>
          </button>
          <button
            onClick={() => setMobileHistoryOpen(false)}
            className="md:hidden p-2 text-slate-500 hover:text-slate-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-cyan-600 transition-all text-slate-900"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 px-4">
              {searchQuery ? 'No matching conversations.' : 'Your health conversations will appear here.'}
            </div>
          ) : (
            filteredConversations.map(conv => {
              const isSelected = currentConversation?.id === conv.id;
              const isEditing = editingTitleId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    loadConversation(conv.id);
                    navigate(`/chat/${conv.id}`);
                    setMobileHistoryOpen(false);
                  }}
                  className={`group relative p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    isSelected ? 'bg-cyan-50/90 text-cyan-950 font-semibold' : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-600' : 'text-slate-400'}`} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        onBlur={() => handleRename(conv.id)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRename(conv.id);
                          if (e.key === 'Escape') setEditingTitleId(null);
                        }}
                        autoFocus
                        onClick={e => e.stopPropagation()}
                        className="w-full px-1.5 py-0.5 text-xs rounded border border-cyan-600 bg-white"
                      />
                    ) : (
                      <span className="truncate">{conv.title}</span>
                    )}
                  </div>

                  {!isEditing && (
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setEditingTitleId(conv.id);
                          setNewTitle(conv.title);
                        }}
                        title="Rename"
                        className="p-1 text-slate-400 hover:text-slate-700 rounded"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={e => handleDelete(conv.id, e)}
                        title="Delete"
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>{conversations.length} Consultations</span>
          <button
            onClick={() => handleNewConversation()}
            className="text-cyan-700 hover:underline font-semibold"
          >
            + New
          </button>
        </div>
      </div>

      {/* Backdrop for mobile history drawer */}
      {mobileHistoryOpen && (
        <div
          onClick={() => setMobileHistoryOpen(false)}
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 2. Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
        
        {/* Chat Header */}
        <div className="h-14 px-4 border-b border-slate-200 flex items-center justify-between bg-white/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileHistoryOpen(true)}
              className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900 truncate">
                {currentConversation?.title || 'New Health Consultation'}
              </h2>
              <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Evidence-informed clinical AI assistant</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleNewConversation}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Non-intrusive Medical Disclaimer Strip */}
        <div className="bg-slate-50 border-b border-slate-100 px-4 py-1.5 text-[11px] text-slate-500 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
            <span className="truncate">
              Informational guidance only. Does not replace professional clinical evaluation or emergency services.
            </span>
          </div>
          <span className="text-slate-400 text-[10px] shrink-0 font-mono-numbers">v2.4 Guardrailed</span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!currentConversation || currentConversation.messages.length === 0 ? (
            /* Empty State: Suggested Prompts */
            <div className="max-w-2xl mx-auto py-10 space-y-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-cyan-600/10 text-cyan-600 flex items-center justify-center mx-auto shadow-sm">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  How can MediMateAI assist your health today?
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Discuss symptoms, check guidance on your prescriptions, or prepare a tailored question checklist for your doctor.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-cyan-300 text-xs text-slate-800 transition-all space-y-1 group"
                  >
                    <span className="font-semibold text-cyan-800 block text-[11px] uppercase tracking-wider">
                      Prompt Idea
                    </span>
                    <span className="text-slate-700 leading-snug group-hover:text-slate-900">
                      {prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            currentConversation.messages.map(msg => {
              const isUser = msg.role === 'user';
              const isCopied = copiedMsgId === msg.id;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                    isUser ? 'bg-slate-900 text-white' : 'bg-gradient-to-tr from-cyan-600 to-teal-500 text-white shadow-sm'
                  }`}>
                    {isUser ? 'You' : <Sparkles className="w-4 h-4" />}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`space-y-2 max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'}`}>
                    
                    {/* Emergency Alert Card inside assistant message if flagged */}
                    {msg.isUrgent && !isUser && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-rose-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Potential Medical Emergency Flag</span>
                        </div>
                        <p className="text-[11px] text-rose-800 leading-relaxed">
                          Symptoms mentioned may require immediate emergency care. Please dial <strong>911</strong> or proceed to the nearest emergency clinic without delay.
                        </p>
                        <a
                          href="tel:911"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call 911 Immediately</span>
                        </a>
                      </div>
                    )}

                    {/* Bubble Content */}
                    <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      isUser
                        ? 'bg-slate-900 text-white rounded-tr-none'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/80 shadow-xs'
                    }`}>
                      {msg.content}
                    </div>

                    {/* Bubble Footer Actions & Timestamp */}
                    <div className={`flex items-center gap-3 text-[10px] text-slate-400 px-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}>
                      <span className="font-mono-numbers">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      {!isUser && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            className="hover:text-slate-700 flex items-center gap-1"
                            title="Copy response"
                          >
                            {isCopied ? (
                              <>
                                <CheckCheck className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Suggested follow-up questions from assistant */}
                    {!isUser && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                      <div className="pt-2 space-y-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Suggested Inquiries
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {msg.suggestedQuestions.map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSendMessage(q)}
                              className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 hover:text-cyan-700 transition-colors text-left"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })
          )}

          {/* Typing Indicator */}
          {isSending && (
            <div className="flex gap-3 max-w-3xl mr-auto animate-fade-in">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-slate-100 rounded-2xl rounded-tl-none border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <div className="flex gap-1 items-center">
                  <span className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-cyan-600 animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span className="text-[11px] text-slate-500">MediMateAI is analyzing clinical context...</span>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
              <span>{errorMessage}</span>
              <button 
                onClick={() => handleSendMessage()} 
                className="font-semibold underline flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-slate-50 rounded-2xl border border-slate-200 p-2 focus-within:ring-2 focus-within:ring-cyan-600/20 focus-within:border-cyan-600 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about symptoms, drug dosage, or checkup preparation (Enter to send)..."
              disabled={isSending}
              className="w-full bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 focus:outline-none resize-none max-h-44 disabled:opacity-50"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isSending}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl disabled:opacity-40 transition-all shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-400 mt-2">
            MediMateAI does not replace clinical examinations. In an emergency, dial 911 immediately.
          </p>
        </div>

      </div>
    </div>
  );
};
