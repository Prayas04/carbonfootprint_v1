import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MarkdownComponents = {
  h1: ({...props}) => <h1 className="text-xl font-bold mt-4 mb-2 text-on-surface" {...props} />,
  h2: ({...props}) => <h2 className="text-lg font-bold mt-3 mb-2 text-on-surface" {...props} />,
  h3: ({...props}) => <h3 className="text-base font-bold mt-2 mb-1 text-on-surface" {...props} />,
  p: ({...props}) => <p className="mb-2 leading-relaxed last:mb-0" {...props} />,
  ul: ({...props}) => <ul className="list-disc pl-5 mb-2 space-y-1 text-sm" {...props} />,
  ol: ({...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1 text-sm" {...props} />,
  li: ({...props}) => <li className="marker:text-primary" {...props} />,
  a: ({...props}) => <a className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
  code: ({className, children, ...props}) => {
    const match = /language-(\w+)/.exec(className || '');
    if (match) {
      return <code className={`${className} bg-transparent p-0 text-xs font-mono text-on-surface`} {...props}>{children}</code>;
    }
    return (
      <code className="bg-surface-container-highest/50 px-1 py-0.5 rounded text-xs font-mono text-primary font-medium" {...props}>
        {children}
      </code>
    );
  },
  pre: ({children, ...props}) => (
    <div className="my-2 rounded-lg overflow-hidden bg-surface-container-lowest border border-outline-variant/50 shadow-sm text-xs">
      <pre className="p-2 overflow-x-auto font-mono text-on-surface" {...props}>
        {children}
      </pre>
    </div>
  ),
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: 'Welcome to CarbonTrack Sentinel Assistant.\n\nHow can I assist you with your sustainability objectives today?',
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputValue
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const allMessages = [...messages, newUserMessage];
      const apiMessages = allMessages.map(msg => ({
        role: msg.sender === 'bot' ? 'assistant' : 'user',
        content: msg.text
      }));

      const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      });
      
      if (!response.ok) {
        throw new Error('Server responded with ' + response.status);
      }

      setIsLoading(false); 

      const botMessageId = Date.now() + 1;
      const botResponse = {
        id: botMessageId,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: '',
      };
      setMessages((prev) => [...prev, botResponse]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let streamedText = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkValue = decoder.decode(value, { stream: true });
          streamedText += chunkValue;
          
          setMessages((prev) => prev.map(msg => 
            msg.id === botMessageId ? { ...msg, text: streamedText } : msg
          ));
        }
      }
    } catch (error) {
      console.error('Failed to fetch from assistant API', error);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "I'm having trouble connecting to the server. Please make sure the AI service is running.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  useEffect(() => {
    const handleToggleChat = () => setIsOpen((prev) => !prev);
    window.addEventListener('toggle-chat', handleToggleChat);
    return () => window.removeEventListener('toggle-chat', handleToggleChat);
  }, []);

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-[88px] right-4 md:bottom-[100px] md:right-8 w-[calc(100vw-32px)] md:w-[400px] h-[65vh] max-h-[600px] bg-surface rounded-2xl shadow-2xl border border-surface-container-highest flex flex-col z-[90] overflow-hidden flex flex-col font-sans">
          
          {/* Header */}
          <div className="bg-primary-container text-on-primary-container px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-on-primary-container/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">eco</span>
              </div>
              <div>
                <h3 className="font-bold text-sm">CarbonTrack Sentinel</h3>
                <p className="text-[10px] opacity-80">AI Sustainability Guide</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-on-primary-container/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors">
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-surface-container-lowest flex flex-col gap-4">
            <div className="text-center font-data-sm text-xs text-on-surface-variant my-2">
              Today, {new Date().toLocaleDateString()}
            </div>
            
            {messages.map((msg) => (
              msg.sender === 'bot' ? (
                <div key={msg.id} className="flex items-start gap-2 max-w-[90%]">
                  <div className="w-6 h-6 rounded-full bg-primary-container shrink-0 flex items-center justify-center mt-1">
                    <span className="material-symbols-outlined text-on-primary-container text-[14px]">smart_toy</span>
                  </div>
                  <div className="bg-surface-container rounded-2xl rounded-tl-sm px-3 py-2 border border-surface-variant text-on-surface text-sm shadow-sm overflow-hidden">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} 
                      components={MarkdownComponents}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex flex-col items-end gap-1 mt-2 self-end max-w-[90%]">
                  <div className="bg-secondary-container text-on-secondary-container rounded-2xl rounded-tr-sm px-3 py-2 text-sm shadow-sm whitespace-pre-wrap">
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-on-surface-variant mr-1">{msg.timestamp}</span>
                </div>
              )
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-2 max-w-[90%]">
                <div className="w-6 h-6 rounded-full bg-primary-container shrink-0 flex items-center justify-center mt-1">
                  <span className="material-symbols-outlined text-on-primary-container text-[14px] animate-pulse">smart_toy</span>
                </div>
                <div className="bg-surface-container rounded-2xl rounded-tl-sm px-3 py-2 border border-surface-variant text-on-surface text-sm shadow-sm">
                  <span className="animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-surface border-t border-surface-variant shrink-0">
            <div className="relative flex items-center bg-surface-container-lowest rounded-full border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/50 transition-all">
              <input 
                className="w-full bg-transparent border-none text-on-surface placeholder:text-on-surface-variant text-sm py-2.5 pl-4 pr-12 focus:ring-0 focus:outline-none" 
                placeholder="Ask about sustainability..." 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button 
                className="absolute right-1 bg-primary text-on-primary rounded-full w-8 h-8 flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
              </button>
            </div>
            <div className="text-center mt-1.5">
              <span className="text-[9px] text-on-surface-variant/70">AI may produce inaccurate info.</span>
            </div>
          </div>
          
        </div>
      )}
    </>
  );
}
