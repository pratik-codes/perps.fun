import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface Player {
  id: string;
  username: string;
  position: 'Long' | 'Short';
  leverage: number;
  pnl: number;
  entryPrice: number;
  entryTime: number;
  isActive: boolean;
}

interface PlayersSidebarProps {
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

export const PlayersSidebar = ({ solPrice, isArenaActive, tradeMarkers }: PlayersSidebarProps) => {
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', username: "SolKing", position: "Long", leverage: 10, pnl: 0, entryPrice: 180.45, entryTime: Date.now() - 60000, isActive: true },
    { id: '2', username: "DegenApe", position: "Short", leverage: 5, pnl: 0, entryPrice: 181.20, entryTime: Date.now() - 45000, isActive: true },
    { id: '3', username: "PerpMaster", position: "Long", leverage: 25, pnl: 0, entryPrice: 179.80, entryTime: Date.now() - 30000, isActive: true },
    { id: '4', username: "LongBoi", position: "Long", leverage: 2, pnl: 0, entryPrice: 180.10, entryTime: Date.now() - 75000, isActive: true },
    { id: '5', username: "ShortSqueeze", position: "Short", leverage: 10, pnl: 0, entryPrice: 182.00, entryTime: Date.now() - 20000, isActive: true },
    { id: '6', username: "DiamondHands", position: "Long", leverage: 1, pnl: 0, entryPrice: 179.50, entryTime: Date.now() - 90000, isActive: true },
    { id: '7', username: "CryptoNinja", position: "Short", leverage: 5, pnl: 0, entryPrice: 181.80, entryTime: Date.now() - 15000, isActive: true },
    { id: '8', username: "TradingBot", position: "Long", leverage: 50, pnl: 0, entryPrice: 180.90, entryTime: Date.now() - 35000, isActive: true },
  ]);

  // Calculate PnL based on current price vs entry price
  const calculatePnL = (player: Player) => {
    const priceDiff = solPrice - player.entryPrice;
    const direction = player.position === 'Long' ? 1 : -1;
    return (priceDiff / player.entryPrice) * direction * player.leverage * 100;
  };

  // Update PnL for all players based on current price (real-time)
  useEffect(() => {
    if (solPrice > 0) {
      setPlayers(prev => prev.map(player => {
        const priceDiff = solPrice - player.entryPrice;
        const direction = player.position === 'Long' ? 1 : -1;
        const newPnl = (priceDiff / player.entryPrice) * direction * player.leverage * 100;
        
        return {
          ...player,
          pnl: newPnl
        };
      }));
    }
  }, [solPrice]);

  // Handle new trades from markers
  useEffect(() => {
    if (tradeMarkers.length > 0) {
      const latestMarker = tradeMarkers[tradeMarkers.length - 1];
      
      // Check if this is a new trade (within last 2 seconds)
      if (Date.now() - latestMarker.timestamp < 2000) {
        setPlayers(prev => {
          const existingPlayerIndex = prev.findIndex(p => p.username === latestMarker.username);
          
          if (existingPlayerIndex >= 0) {
            // Update existing player with new position
            const updated = [...prev];
            updated[existingPlayerIndex] = {
              ...updated[existingPlayerIndex],
              position: latestMarker.type,
              leverage: latestMarker.leverage,
              entryPrice: latestMarker.price,
              entryTime: latestMarker.timestamp,
              pnl: 0,
              isActive: true
            };
            return updated;
          } else {
            // Add new player if not in list
            const newPlayer: Player = {
              id: latestMarker.id,
              username: latestMarker.username,
              position: latestMarker.type,
              leverage: latestMarker.leverage,
              entryPrice: latestMarker.price,
              entryTime: latestMarker.timestamp,
              pnl: 0,
              isActive: true
            };
            return [...prev.slice(-7), newPlayer]; // Keep max 8 players
          }
        });
      }
    }
  }, [tradeMarkers]);

  // Sort players by PnL - more frequent updates for better responsiveness
  const sortedPlayers = [...players].sort((a, b) => b.pnl - a.pnl);

  // Simulate some players closing positions occasionally
  useEffect(() => {
    if (!isArenaActive) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance
        setPlayers(prev => {
          const activePlayersCount = prev.filter(p => p.isActive).length;
          if (activePlayersCount > 4) { // Keep at least 4 active
            const randomIndex = Math.floor(Math.random() * prev.length);
            const updated = [...prev];
            if (updated[randomIndex] && Math.abs(updated[randomIndex].pnl) > 5) {
              updated[randomIndex] = { ...updated[randomIndex], isActive: false };
            }
            return updated;
          }
          return prev;
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isArenaActive]);

  return (
    <div className="w-80 h-full bg-card border-l border-border">
      <div className="p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Active Traders</h3>
        
        <div className="space-y-1">
          <AnimatePresence>
            {sortedPlayers.filter(p => p.isActive).map((player, index) => {
              const timeHeld = Math.floor((Date.now() - player.entryTime) / 1000);
              const isRecentTrade = Date.now() - player.entryTime < 3000;
              
              return (
                <motion.div
                  key={player.id}
                  layout
                  initial={isRecentTrade ? { opacity: 0, x: 50, scale: 0.9 } : false}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className={`flex items-center justify-between p-2 rounded transition-colors ${
                    index === 0 ? 'bg-profit/10 border border-profit/20' :
                    index === 1 ? 'bg-primary/10 border border-primary/20' :
                    index === 2 ? 'bg-orange-500/10 border border-orange-500/20' :
                    'hover:bg-muted/50'
                  } ${isRecentTrade ? 'ring-2 ring-primary/50' : ''}`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        player.position === 'Long' ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss'
                      }`}>
                        <span className="text-xs">{player.position === 'Long' ? '↗' : '↘'}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-foreground font-medium">{player.username}</span>
                        {index < 3 && <span className="text-xs">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {player.leverage}x {player.position} • ${player.entryPrice.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {timeHeld < 60 ? `${timeHeld}s` : `${Math.floor(timeHeld/60)}m`} ago
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <motion.div 
                      key={player.pnl.toFixed(1)}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`text-sm font-bold ${
                        player.pnl >= 10 ? 'text-green-400' :
                        player.pnl >= 0 ? 'text-profit' : 
                        player.pnl >= -10 ? 'text-loss' : 'text-red-500'
                      }`}
                    >
                      {player.pnl >= 0 ? '+' : ''}{player.pnl.toFixed(1)}%
                    </motion.div>
                    <div className="text-xs text-muted-foreground">
                      ${(Math.abs(player.pnl * player.leverage * 10)).toFixed(0)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        
        {/* Liquidated players */}
        {sortedPlayers.some(p => !p.isActive) && (
          <div className="mt-4 pt-4 border-t border-border">
            <h4 className="text-xs text-muted-foreground mb-2">Recently Closed</h4>
            <div className="space-y-1">
              {sortedPlayers.filter(p => !p.isActive).slice(0, 3).map((player) => (
                <div key={player.id} className="flex items-center justify-between p-2 opacity-50">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs">✓</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{player.username}</span>
                  </div>
                  <span className={`text-xs ${
                    player.pnl >= 0 ? 'text-profit' : 'text-loss'
                  }`}>
                    {player.pnl >= 0 ? '+' : ''}{player.pnl.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};