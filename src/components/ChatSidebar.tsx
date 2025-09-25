import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  level: number;
  timestamp: Date;
  type: 'trade' | 'chat' | 'system';
  verified?: boolean;
}

interface User {
  username: string;
  level: number;
  status: string;
  verified?: boolean;
}

interface ChatSidebarProps {
  solPrice: number;
  isArenaActive: boolean;
  tradeMarkers: Array<{
    id: string;
    username: string;
    type: 'Long' | 'Short';
    price: number;
    leverage: number;
    timestamp: number;
  }>;
}

export const ChatSidebar = ({ solPrice, isArenaActive, tradeMarkers }: ChatSidebarProps) => {
  const [onlineCount, setOnlineCount] = useState(1247);
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      username: 'SolKing',
      message: 'LFG! New arena starting soon 🚀',
      level: 42,
      timestamp: new Date(Date.now() - 30000),
      type: 'chat',
      verified: true
    },
    {
      id: '2', 
      username: 'DegenApe',
      message: 'Who else is ready for some volatility?',
      level: 38,
      timestamp: new Date(Date.now() - 15000),
      type: 'chat',
      verified: true
    }
  ]);
  const [lastPrice, setLastPrice] = useState(solPrice);
  
  // Trading-related chat messages that get triggered by price movements and trades
  const chatTemplates = {
    priceUp: [
      "PUMPING! 🚀",
      "Called this pump earlier 📈",
      "To the moon! 🌙",
      "Bulls in control 💪",
      "LFG!! Green candles everywhere",
      "This rally is insane",
      "SOL going parabolic"
    ],
    priceDown: [
      "Dip buying opportunity 💎",
      "Support holding strong",
      "Bear trap incoming?",
      "Time to average down",
      "Weak hands selling",
      "This is just a retest",
      "Buy the dip!"
    ],
    trades: [
      "Nice entry!",
      "Bold move with that leverage",
      "Following this trade",
      "Risky but could pay off",
      "Diamond hands only 💎",
      "Let's see how this plays out",
      "Copying this position"
    ],
    general: [
      "Arena is heating up 🔥",
      "Volume picking up",
      "Who else is watching this?",
      "Volatility is crazy today",
      "Best arena so far",
      "These swings are wild",
      "Peak degen hours",
      "Chart looking bullish",
      "Resistance at this level",
      "LFG boys! 🚀"
    ]
  };

  const userPool = [
    { username: "SolKing", level: 42, verified: true },
    { username: "DegenApe", level: 38, verified: true },
    { username: "PerpMaster", level: 35, verified: true },
    { username: "LongBoi", level: 28, verified: false },
    { username: "ShortSqueeze", level: 31, verified: true },
    { username: "DiamondHands", level: 25, verified: false },
    { username: "CryptoNinja", level: 33, verified: false },
    { username: "TradingBot", level: 19, verified: false },
    { username: "MoonBoy", level: 22, verified: false },
    { username: "ChadTrader", level: 29, verified: false },
    { username: "PumpChaser", level: 15, verified: false },
    { username: "DipBuyer", level: 27, verified: false },
    { username: "YieldFarmer", level: 34, verified: true },
    { username: "LiquidationBot", level: 50, verified: true },
    { username: "WhaleAlert", level: 45, verified: true }
  ];

  const getLevelColor = (level: number) => {
    if (level >= 40) return "text-yellow-400";
    if (level >= 30) return "text-blue-400";
    if (level >= 20) return "text-green-400";
    return "text-muted-foreground";
  };

  const getRandomUser = () => userPool[Math.floor(Math.random() * userPool.length)];
  const getRandomMessage = (type: keyof typeof chatTemplates) => {
    const messages = chatTemplates[type];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const addChatMessage = (type: 'trade' | 'chat' | 'system', customMessage?: string, customUser?: any) => {
    const user = customUser || getRandomUser();
    let message = customMessage;
    
    if (!message) {
      if (type === 'chat') {
        message = Math.random() > 0.7 ? getRandomMessage('general') : 
                 (solPrice > lastPrice ? getRandomMessage('priceUp') : getRandomMessage('priceDown'));
      } else if (type === 'trade') {
        message = getRandomMessage('trades');
      }
    }

    const newMessage: ChatMessage = {
      id: Math.random().toString(36),
      username: user.username,
      message: message || 'Nice move!',
      level: user.level,
      timestamp: new Date(),
      type,
      verified: user.verified
    };

    setChatMessages(prev => {
      const updated = [...prev.slice(-20), newMessage]; // Keep last 20 messages
      console.log('Added chat message:', newMessage.username, newMessage.message);
      return updated;
    });
  };

  const addUserMessage = (message: string) => {
    const userMessage: ChatMessage = {
      id: Math.random().toString(36),
      username: "You",
      message: message,
      level: 1,
      timestamp: new Date(),
      type: 'chat',
      verified: false
    };

    setChatMessages(prev => {
      const updated = [...prev.slice(-20), userMessage]; // Keep last 20 messages
      return updated;
    });
  };

  const handleSubmitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim()) {
      addUserMessage(userInput.trim());
      setUserInput("");
    }
  };

  // Add messages based on trade markers
  useEffect(() => {
    if (tradeMarkers.length > 0) {
      const latestMarker = tradeMarkers[tradeMarkers.length - 1];
      if (Date.now() - latestMarker.timestamp < 1000) { // Recent trade
        const traderUser = userPool.find(u => u.username === latestMarker.username) || getRandomUser();
        
        // Sometimes add a trade message
        if (Math.random() > 0.6) {
          setTimeout(() => {
            addChatMessage('trade', undefined, traderUser);
          }, Math.random() * 2000 + 500);
        }
      }
    }
  }, [tradeMarkers]);

  // Add random chat messages
  useEffect(() => {
    if (!isArenaActive) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.4) { // 60% chance to add message
        addChatMessage('chat');
      }
    }, 5000 + Math.random() * 3000); // 5-8 seconds for more manageable pace

    return () => clearInterval(interval);
  }, [isArenaActive]);

  // Track price changes
  useEffect(() => {
    setLastPrice(solPrice);
  }, [solPrice]);

  // Simulate online count changes
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(prev => {
        const change = Math.floor(Math.random() * 10) - 5; // -5 to +5
        return Math.max(1200, Math.min(1300, prev + change));
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  // Initialize with some chat activity on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      addChatMessage('chat', 'Charts looking spicy today 🔥', userPool[0]);
    }, 2000);
    
    const timer2 = setTimeout(() => {
      addChatMessage('chat', 'Volume picking up, this could pump', userPool[2]);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatMessages]);

  return (
    <div className="w-80 h-full bg-card border-r border-border flex flex-col">
      {/* Online Status */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-profit rounded-full animate-pulse"></div>
          <span className="text-sm text-muted-foreground">online ({onlineCount.toLocaleString()})</span>
        </div>
        <div className="text-xs text-profit font-bold mt-1">Arena: SOL-USDT Perps</div>
        
        {/* <div className="flex items-center space-x-2 mt-2">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-xs">💬</span>
          </div>
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-xs">𝕏</span>
          </div>
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <span className="text-xs">⚫</span>
          </div>
        </div> */}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-2 chat-messages" style={{ minHeight: 0 }}>
        {chatMessages.length === 0 && (
          <div className="p-4 text-center text-muted-foreground text-sm">
            Chat loading...
          </div>
        )}
        <AnimatePresence>
          {chatMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={`p-3 hover:bg-muted/50 border-b border-border/50 ${
                message.type === 'trade' ? 'bg-primary/5' : message.username === 'You' ? 'bg-green-500/10' : ''
              }`}
            >
              <div className="flex items-start space-x-2">
                <Badge 
                  variant="outline" 
                  className={`${getLevelColor(message.level)} border-current text-xs`}
                >
                  {message.level}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium text-foreground">{message.username}</span>
                    {message.verified && <span className="text-xs text-primary">✓</span>}
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs break-words ${
                    message.type === 'trade' ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {message.message}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Chat Input - Always Visible */}
      <div className="flex-shrink-0 p-3 border-t-2 border-profit/30 bg-card/95 backdrop-blur-sm min-h-[100px] mb-20">
        <form onSubmit={handleSubmitMessage} className="flex space-x-2 mb-3">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 text-sm h-10 border-2 border-profit/20 focus:border-profit/50"
            maxLength={100}
          />
          <Button 
            type="submit" 
            size="sm" 
            disabled={!userInput.trim()}
            className="bg-profit hover:bg-profit/80 text-black font-semibold"
          >
            Send
          </Button>
        </form>
        <div className="flex justify-between items-center text-xs">
          <button className="text-profit hover:underline font-medium">Chat Rules</button>
          <span className="text-muted-foreground">📋 ❓</span>
        </div>
      </div>
    </div>
  );
};