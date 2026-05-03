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
            // Only show messages relevant to this conversation
            const isRelevant =
                (msg.senderId === receiverId) ||
                (msg.senderId?.toString() === receiverId?.toString());
            if (isRelevant) {
                setMessages(prev => [...prev, msg]);
            }
        };

        const handleMessageSent = (msg) => {
            // Replace the optimistic message with the confirmed one from server
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

        // CLEANUP: Remove listeners on unmount to prevent memory leaks
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

        // Optimistic: add message instantly before server confirms
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
        <div className="flex flex-col h-[480px] bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/30 flex items-center justify-center font-bold text-white text-sm">
                    {receiverName?.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm">{receiverName}</h3>
                    <p className="text-green-100 text-xs">
                        {socket.connected ? '🟢 Live' : '🔴 Reconnecting...'}
                    </p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {isLoading && (
                    <p className="text-center text-gray-400 text-sm animate-pulse">Loading messages...</p>
                )}
                {error && (
                    <p className="text-center text-red-400 text-sm">{error}</p>
                )}
                {!isLoading && messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-sm">Start the conversation!</p>
                    </div>
                )}
                {messages.map((msg, idx) => {
                    const mine = isMyMessage(msg);
                    return (
                        <div key={msg._id || msg._tempId || idx} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[72%] px-4 py-2 rounded-2xl text-sm shadow-sm
                                ${mine
                                    ? 'bg-green-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                }
                                ${msg._optimistic ? 'opacity-70' : 'opacity-100'}
                            `}>
                                <p>{msg.message}</p>
                                <p className={`text-[10px] mt-1 ${mine ? 'text-green-200' : 'text-gray-400'} text-right`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="px-4 py-3 border-t border-gray-100 bg-white flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || !socket.connected}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatBox;
