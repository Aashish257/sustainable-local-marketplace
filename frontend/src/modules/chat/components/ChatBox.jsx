import { useState, useEffect, useRef } from 'react';
import socket from '../../../services/socket';
import { getChatHistory } from '../services/chatService';
import useAuthStore from '../../../store/authStore';

const ChatBox = ({ receiverId, receiverName }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const { user } = useAuthStore();

    // Auto-scroll to the latest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 1. Fetch chat history from REST API on mount
    useEffect(() => {
        if (!receiverId) return;
        setIsLoading(true);
        getChatHistory(receiverId)
            .then(res => {
                setMessages(res.data || []);
                setError(null);
            })
            .catch(() => setError('Failed to load messages.'))
            .finally(() => setIsLoading(false));
    }, [receiverId]);

    // 2. Register socket listeners — CRITICAL: clean up on unmount
    useEffect(() => {
        const handleReceiveMessage = (msg) => {
            const isRelevant =
                (msg.senderId === receiverId) ||
                (msg.senderId?.toString() === receiverId?.toString());
            if (isRelevant) {
                setMessages(prev => [...prev, msg]);
            }
        };

        const handleMessageSent = (msg) => {
            setMessages(prev =>
                prev.map(m => m._tempId === msg._tempId ? msg : m)
            );
        };

        const handleChatError = ({ message }) => {
            setError(message);
        };

        socket.on('receive_message', handleReceiveMessage);
        socket.on('message_sent', handleMessageSent);
        socket.on('chat_error', handleChatError);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('message_sent', handleMessageSent);
            socket.off('chat_error', handleChatError);
        };
    }, [receiverId]);

    // 3. Send message with Optimistic UI
    const handleSend = (e) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (!trimmed || !socket.connected) return;

        const tempId = Date.now().toString();
        const optimisticMsg = {
            _tempId: tempId,
            senderId: user?.id,
            receiverId,
            message: trimmed,
            createdAt: new Date().toISOString(),
            _optimistic: true,
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setInput('');

        socket.emit('send_message', { receiverId, message: trimmed, _tempId: tempId });
    };

    const isMyMessage = (msg) => {
        const senderId = msg.senderId?._id || msg.senderId;
        return senderId === user?.id || senderId?.toString() === user?.id?.toString();
    };

    return (
        <div className="flex flex-col h-[480px] glass-card overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-[var(--border-card)] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-display font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                        {receiverName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-[var(--text-main)] font-display">{receiverName}</h3>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-mono">
                            <span className={`w-1.5 h-1.5 rounded-full ${socket.connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                            {socket.connected ? 'DIRECT PEER CONNECTED' : 'OFFLINE'}
                        </p>
                    </div>
                </div>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    LIVE
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--bg-page)]">
                {isLoading && (
                    <p className="text-center text-[var(--text-muted)] text-xs animate-pulse font-mono">
                        Loading messages...
                    </p>
                )}
                {error && (
                    <p className="text-center text-rose-500 text-xs font-mono">{error}</p>
                )}
                {!isLoading && messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-xs">
                        <p>No messages yet. Send a message to get started.</p>
                    </div>
                )}
                {messages.map((msg, idx) => {
                    const mine = isMyMessage(msg);
                    return (
                        <div key={msg._id || msg._tempId || idx} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-xs shadow-sm
                                ${mine
                                    ? 'bg-emerald-600 text-white rounded-br-none shadow-emerald-600/20'
                                    : 'glass-card text-[var(--text-main)] rounded-bl-none'
                                }
                                ${msg._optimistic ? 'opacity-70' : 'opacity-100'}
                            `}>
                                <p className="font-sans leading-relaxed">{msg.message}</p>
                                <p className={`text-[9px] mt-1 font-mono ${mine ? 'text-emerald-100' : 'text-[var(--text-muted)]'} text-right`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-3 border-t border-[var(--border-card)] bg-black/[0.02] dark:bg-white/[0.02] flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border-card)] text-[var(--text-main)] text-xs font-sans focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-[var(--text-muted)]"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || !socket.connected}
                    className="btn-primary px-4 py-2 text-xs font-semibold uppercase disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatBox;

