import React, { useState, useEffect, useRef } from 'react';
import { useCouple } from '../src/contexts/CoupleContext';
import { ChatMessage } from '../src/types';
import Loader from '../src/components/Loader';
import { ChatBubbleOvalLeftEllipsisIcon, PaperAirplaneIcon } from '../src/components/Icons';

const NexoGuide: React.FC = () => {
    const { api } = useCouple();
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            role: 'model',
            text: 'Hola, soy Nexo, vuestro Guía Íntimo. Estoy aquí para ayudaros a tejer nuevas historias y experiencias. ¿En qué puedo inspiraros hoy? Podéis pedirme un ritual para esta noche, una idea para una cita atrevida, o simplemente charlar sobre vuestros deseos.'
        }
    ]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: userInput };
        const newMessages = [...messages, userMessage];

        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await api.continueNexoChat({ messages: newMessages });
            if (response) {
                const modelMessage: ChatMessage = { role: 'model', text: response.text };
                setMessages(prev => [...prev, modelMessage]);
            }
        } catch (err: any) {
            setError('Lo siento, he tenido un problema para procesar tu petición. Por favor, inténtalo de nuevo.');
            // Revert to previous messages on error
            setMessages(messages);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-5rem)] max-w-4xl mx-auto bg-brand-navy rounded-xl shadow-2xl border border-brand-muted/10 animate-fade-in">
            {/* Header */}
            <div className="p-4 border-b border-brand-muted/20 flex items-center gap-4 flex-shrink-0">
                <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8 text-brand-accent"/>
                <div>
                    <h2 className="text-xl font-serif font-bold text-brand-light">Nexo, vuestro Guía Íntimo</h2>
                    <p className="text-sm text-brand-muted">Vuestro confidente IA para la conexión y el placer.</p>
                </div>
            </div>
            
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center flex-shrink-0"><ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-white"/></div>}
                        <div className={`max-w-xl p-3 px-4 rounded-2xl shadow-md ${msg.role === 'user' ? 'bg-brand-accent text-white rounded-br-none' : 'bg-brand-deep-purple text-brand-light rounded-bl-none'}`}>
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex items-end gap-2 justify-start">
                        <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center flex-shrink-0"><ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5 text-white"/></div>
                        <div className="max-w-lg p-3 px-4 rounded-2xl shadow-md bg-brand-deep-purple text-brand-light rounded-bl-none">
                            <Loader text="Pensando..." />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-brand-muted/20 flex-shrink-0">
                 {error && <p className="text-red-400 text-sm mb-2 text-center">{error}</p>}
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <input 
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Pide un consejo, un reto, una historia..."
                        className="w-full bg-brand-deep-purple border border-brand-muted/50 rounded-full py-3 px-5 text-brand-light focus:ring-2 focus:ring-brand-accent transition disabled:bg-brand-deep-purple/50"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !userInput.trim()} className="bg-brand-accent text-white rounded-full p-3 hover:bg-pink-600 transition-transform duration-200 transform hover:scale-110 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:scale-100">
                        <PaperAirplaneIcon className="w-5 h-5"/>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default NexoGuide;
