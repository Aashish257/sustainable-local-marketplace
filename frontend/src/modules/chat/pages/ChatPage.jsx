import { useState, useEffect, useRef } from 'react';
import socket from '../../../services/socket';
import { getChatHistory, getConversations } from '../services/chatService';
import useAuthStore from '../../../store/authStore';
import { useLocation } from 'react-router-dom';

// ---- Thread List (left pane) -------------------------------------------
const ThreadList = ({ threads, activeId, onSelect, isLoading }) => (
    <div className="flex flex-col h-full bg-black/[0.02] dark:bg-white/[0.02]">
        <div className="px-5 py-4 border-b border-[var(--border-card)]">
            <h2 className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Direct Channels
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-sans">
                Real-time peer conversations
            </p>
        </div>
        <div className="flex-1 overflow-y-auto">
            {isLoading ? (
                <div className="p-5 space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 animate-pulse">
                            <div className="w-9 h-9 rounded-xl bg-[var(--border-card)]" />
                            <div className="flex-1 space-y-1.5">
                                <div className="h-3 bg-[var(--border-card)] rounded w-1/2" />
                                <div className="h-2.5 bg-[var(--border-card)] rounded w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : threads.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 px-4 text-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <p className="text-sm font-bold text-[var(--text-main)] font-display">No Conversations</p>
                    <p className="text-xs text-[var(--text-muted)] max-w-xs">
                        Initiate a conversation directly from any producer or product page.
                    </p>
                </div>
            ) : (
                threads.map((t) => (
                    <button
                        key={t.userId}
                        onClick={() => onSelect(t)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-card)] transition-all cursor-pointer ${
                            activeId === t.userId
                                ? 'bg-emerald-500/10 border-l-4 border-l-emerald-500'
                                : 'hover:bg-black/[0.04] dark:hover:bg-white/[0.04]'
                        }`}
                    >
                        <div className="w-10 h-10 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex-shrink-0 flex items-center justify-center font-display font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                            {t.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                                <p className="text-xs font-bold text-[var(--text-main)] truncate">{t.name}</p>
                                {t.role && (
                                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--border-card)] text-[var(--text-muted)]">
                                        {t.role}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-[var(--text-muted)] truncate font-sans">
                                {t.lastMessage || 'Click to begin conversation'}
                            </p>
                        </div>
                        {t.unread > 0 && (
                            <span className="w-5 h-5 bg-emerald-600 text-white text-xs font-mono font-bold rounded-full flex items-center justify-center flex-shrink-0">
                                {t.unread}
                            </span>
                        )}
                    </button>
                ))
            )}
        </div>
    </div>
);

// ---- Conversation Pane (right) ------------------------------------------
const ConversationPane = ({ thread, currentUserId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!thread?.userId) return;
        setIsLoading(true);
        setMessages([]);
        getChatHistory(thread.userId)
            .then(res => {
                setMessages(res.data || []);
                setError(null);
            })
            .catch(() => setError('Could not load message history.'))
            .finally(() => setIsLoading(false));
    }, [thread?.userId]);

    useEffect(() => {
        const handleReceive = (msg) => {
            const from = msg.senderId?._id || msg.senderId;
            if (from?.toString() === thread?.userId?.toString()) {
                setMessages(prev => [...prev, msg]);
            }
        };
        const handleSent = (msg) => {
            setMessages(prev => prev.map(m => m._tempId === msg._tempId ? msg : m));
        };
        socket.on('receive_message', handleReceive);
        socket.on('message_sent', handleSent);
        return () => {
            socket.off('receive_message', handleReceive);
            socket.off('message_sent', handleSent);
        };
    }, [thread?.userId]);

    const handleSend = (e) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || !socket.connected || !thread) return;
        const tempId = Date.now().toString();
        setMessages(prev => [...prev, {
            _tempId: tempId,
            senderId: currentUserId,
            message: trimmed,
            createdAt: new Date().toISOString(),
            _optimistic: true
        }]);
        setInput('');
        socket.emit('send_message', { receiverId: thread.userId, message: trimmed, _tempId: tempId });
    };

    const isMe = (msg) => {
        const sid = msg.senderId?._id || msg.senderId;
        return sid?.toString() === currentUserId?.toString();
    };

    if (!thread) return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-3 p-8">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            </div>
            <div>
                <p className="font-bold text-[var(--text-main)] text-sm font-display">Select a conversation</p>
                <p className="text-[var(--text-muted)] text-xs mt-1 font-sans max-w-sm">
                    Choose a contact from the left pane to view message history and send direct inquiries.
                </p>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-[var(--bg-card)]">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[var(--border-card)] flex items-center gap-3 bg-black/[0.02] dark:bg-white/[0.02] flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-display font-bold text-emerald-600 dark:text-emerald-400 text-xs flex-shrink-0">
                    {thread.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                    <p className="font-bold text-[var(--text-main)] text-xs">{thread.name}</p>
                    <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${socket.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                        {socket.connected ? 'LIVE MESSAGING CONNECTED' : 'CONNECTING...'}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-[var(--bg-page)]">
                {isLoading && (
                    <p className="text-center text-[var(--text-muted)] font-mono text-xs py-4 animate-pulse">
                        Loading messages…
                    </p>
                )}
                {error && (
                    <p className="text-center text-rose-500 font-mono text-xs py-4">
                        {error}
                    </p>
                )}
                {!isLoading && messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-xs">
                        <p>Say hello to initiate this conversation.</p>
                    </div>
                )}
                {messages.map((msg, idx) => {
                    const mine = isMe(msg);
                    return (
                        <div key={msg._id || msg._tempId || idx} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs ${
                                mine
                                    ? 'bg-emerald-600 text-white rounded-br-none shadow-sm shadow-emerald-600/20'
                                    : 'glass-card text-[var(--text-main)] rounded-bl-none'
                            } ${msg._optimistic ? 'opacity-70' : 'opacity-100'}`}>
                                <p className="leading-relaxed font-sans">{msg.message}</p>
                                <p className={`text-[9px] font-mono mt-1 text-right ${mine ? 'text-emerald-100' : 'text-[var(--text-muted)]'}`}>
                                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="px-4 py-3 border-t border-[var(--border-card)] bg-black/[0.02] dark:bg-white/[0.02] flex gap-2.5 flex-shrink-0">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type your message..."
                    aria-label="Message input"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-page)] text-[var(--text-main)] text-xs font-sans focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-[var(--text-muted)]"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || !socket.connected}
                    aria-label="Send message"
                    className="btn-primary px-5 py-2.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                >
                    <span>Send</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

// ---- Main ChatPage -------------------------------------------------------
const ChatPage = () => {
    const { user } = useAuthStore();
    const location = useLocation();

    const preselect = location.state;

    const [threads, setThreads] = useState([]);
    const [isLoadingThreads, setIsLoadingThreads] = useState(true);
    const [activeThread, setActiveThread] = useState(() => {
        if (preselect?.receiverId && preselect?.receiverName) {
            return { userId: preselect.receiverId, name: preselect.receiverName };
        }
        return null;
    });
    const [mobileView, setMobileView] = useState(preselect ? 'chat' : 'list');

    // Fetch active conversation contacts on mount
    useEffect(() => {
        let isMounted = true;
        setIsLoadingThreads(true);
        getConversations()
            .then((res) => {
                if (!isMounted) return;
                let loaded = res.data || [];
                // If preselected receiver is not in loaded threads, prepend it
                if (preselect?.receiverId && !loaded.find(t => t.userId === preselect.receiverId)) {
                    loaded = [{
                        userId: preselect.receiverId,
                        name: preselect.receiverName || 'Seller',
                        role: 'Seller',
                        lastMessage: 'Conversation initiated...',
                        unread: 0
                    }, ...loaded];
                }
                setThreads(loaded);
                if (!activeThread && loaded.length > 0) {
                    setActiveThread(loaded[0]);
                }
            })
            .catch(() => {
                if (preselect?.receiverId) {
                    setThreads([{
                        userId: preselect.receiverId,
                        name: preselect.receiverName || 'Seller',
                        role: 'Seller',
                        lastMessage: '',
                        unread: 0
                    }]);
                }
            })
            .finally(() => {
                if (isMounted) setIsLoadingThreads(false);
            });

        return () => { isMounted = false; };
    }, [preselect]);

    // Listen for incoming messages to build thread list dynamically
    useEffect(() => {
        const handleReceive = (msg) => {
            const senderId = msg.senderId?._id || msg.senderId;
            const senderName = msg.senderName || 'User';
            setThreads(prev => {
                const exists = prev.find(t => t.userId === senderId?.toString());
                if (exists) {
                    return prev.map(t => t.userId === senderId?.toString()
                        ? { ...t, lastMessage: msg.message, unread: (t.unread || 0) + 1 }
                        : t);
                }
                return [{ userId: senderId?.toString(), name: senderName, lastMessage: msg.message, unread: 1 }, ...prev];
            });
        };
        socket.on('receive_message', handleReceive);
        return () => socket.off('receive_message', handleReceive);
    }, []);

    const handleSelectThread = (t) => {
        setActiveThread(t);
        setThreads(prev => prev.map(th => th.userId === t.userId ? { ...th, unread: 0 } : th));
        setMobileView('chat');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] py-8 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-5xl space-y-6">
                
                {/* Header */}
                <div className="border-b border-[var(--border-card)] pb-4">
                    <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-xs uppercase tracking-wider mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        DIRECT ARTISAN INQUIRIES
                    </div>
                    <h1 className="text-3xl font-black font-display tracking-tight text-[var(--text-main)]">
                        Messages
                    </h1>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 font-sans">
                        Transparent questions on harvest origin, custom requests, and order details.
                    </p>
                </div>

                {/* Two-pane layout */}
                <div className="glass-card overflow-hidden shadow-xl" style={{ minHeight: '70vh' }}>
                    <div className="flex h-full" style={{ minHeight: '70vh' }}>

                        {/* Thread list — hidden on mobile when viewing chat */}
                        <div className={`w-full md:w-72 lg:w-80 border-r border-[var(--border-card)] flex-shrink-0
                            ${mobileView === 'chat' ? 'hidden md:block' : 'block'}`}>
                            <ThreadList
                                threads={threads}
                                activeId={activeThread?.userId}
                                onSelect={handleSelectThread}
                                isLoading={isLoadingThreads}
                            />
                        </div>

                        {/* Conversation — hidden on mobile when viewing list */}
                        <div className={`flex-1 flex flex-col ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
                            {/* Mobile back button */}
                            {mobileView === 'chat' && (
                                <button
                                    onClick={() => setMobileView('list')}
                                    className="md:hidden flex items-center gap-2 px-4 py-3 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border-b border-[var(--border-card)] bg-black/[0.02] dark:bg-white/[0.02]"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    ← All Conversations
                                </button>
                            )}
                            <ConversationPane thread={activeThread} currentUserId={user?.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
