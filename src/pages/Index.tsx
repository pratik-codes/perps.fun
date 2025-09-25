import { useState } from "react";
import { Header } from "@/components/Header";
import { ChatSidebar } from "@/components/ChatSidebar";
import { GameChart } from "@/components/GameChart";
import { PlayersSidebar } from "@/components/PlayersSidebar";
import { GameControls } from "@/components/GameControls";
import { StatsBar } from "@/components/StatsBar";
import { useGameLogic } from "@/hooks/useGameLogic";
import { toast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [balance] = useState(1000.00); // Start with $1000 for arena battles
  const [leverage, setLeverage] = useState(10); // Default to 10x leverage for levs.fun
  const { 
    solPrice,
    gameState,
    arenaTimer,
    countdownTimer,
    winner,
    leaderboard,
    roundType,
    totalPot,
    userPosition,
    tradeMarkers,
    openLong,
    openShort,
    // Legacy support
    isArenaActive,
    arenaEnded
  } = useGameLogic();

  const handleLong = (size: number, leverage: number) => {
    openLong(size, leverage);
    toast({
      title: "Long Position Opened",
      description: `Opened ${size.toFixed(2)} USDT long at $${solPrice.toFixed(2)} with ${leverage}x leverage`,
    });
  };

  const handleShort = (size: number, leverage: number) => {
    openShort(size, leverage);
    toast({
      title: "Short Position Opened", 
      description: `Opened ${size.toFixed(2)} USDT short at $${solPrice.toFixed(2)} with ${leverage}x leverage`,
    });
  };

  return (
    <div className="h-screen w-full bg-background overflow-hidden">
      <Header />
      <StatsBar />
      
      <div className="flex h-[calc(100vh-120px)]">
        {/* Left Sidebar - Chat */}
        <ChatSidebar 
          solPrice={solPrice}
          isArenaActive={isArenaActive}
          tradeMarkers={tradeMarkers}
        />
        
        {/* Main Game Area */}
        <div className="flex-1 flex flex-col">
          {/* Game Chart with overlay container */}
          <div className="flex-1 p-4 min-h-0 relative">
            <GameChart 
              solPrice={solPrice}
              isArenaActive={isArenaActive}
              arenaTimer={arenaTimer}
              totalPot={totalPot}
              tradeMarkers={tradeMarkers}
            />
            
            {/* Initial Countdown Overlay - Only covers chart area */}
            <AnimatePresence>
              {gameState === 'initial_countdown' && (
                <motion.div
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center">
                    <motion.div
                      className="mb-6 flex justify-center"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8 }}
                    >
                      <img 
                        src="/levs-logo-hori.png" 
                        alt="levs.fun Logo" 
                        className="h-16 w-auto"
                      />
                    </motion.div>
                    
                    <motion.div
                      className="text-lg text-muted-foreground mb-6"
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      Get ready for the ultimate leverage battle!
                    </motion.div>

                    <motion.div
                      className="text-6xl font-bold text-profit mb-4"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        textShadow: ["0 0 20px rgba(0, 255, 136, 0.5)", "0 0 40px rgba(0, 255, 136, 0.8)", "0 0 20px rgba(0, 255, 136, 0.5)"]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                      key={countdownTimer}
                    >
                      {countdownTimer}
                    </motion.div>
                    
                    <motion.div
                      className="text-lg text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      Next round starting in...
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Between Rounds Countdown Overlay */}
            <AnimatePresence>
              {gameState === 'between_rounds_countdown' && (
                <motion.div
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="text-center">
                    <motion.div
                      className="text-3xl font-bold text-foreground mb-4"
                      initial={{ scale: 0, y: -30 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      ⚡ NEXT ROUND
                    </motion.div>
                    
                    <motion.div
                      className="text-5xl font-bold text-profit mb-4"
                      animate={{ 
                        scale: [1, 1.1, 1],
                        textShadow: ["0 0 20px rgba(0, 255, 136, 0.5)", "0 0 40px rgba(0, 255, 136, 0.8)", "0 0 20px rgba(0, 255, 136, 0.5)"]
                      }}
                      transition={{ duration: 1, repeat: Infinity }}
                      key={countdownTimer}
                    >
                      {countdownTimer}
                    </motion.div>
                    
                    <motion.div
                      className="text-lg text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      Get ready to trade!
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Game Controls - Fixed Height */}
          <div className="flex-shrink-0">
            <GameControls 
              onLong={handleLong}
              onShort={handleShort}
              balance={balance}
              leverage={leverage}
              onLeverageChange={setLeverage}
              isArenaActive={isArenaActive}
              currentPosition={userPosition}
            />
          </div>
        </div>
        
        {/* Right Sidebar - Players */}
        <PlayersSidebar 
          solPrice={solPrice}
          isArenaActive={isArenaActive}
          tradeMarkers={tradeMarkers}
        />
      </div>
      
      {/* Arena Results Overlay */}
      <AnimatePresence>
        {arenaEnded && (
          <motion.div
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="text-center max-w-2xl w-full">
              <motion.div
                className="text-5xl font-bold text-profit mb-6"
                initial={{ scale: 0, y: -50 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                🏁 ARENA ENDED
              </motion.div>

              {winner && (
                <motion.div
                  className="bg-card border border-profit rounded-lg p-6 mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="text-2xl font-bold text-profit mb-2">🏆 WINNER</div>
                  <div className="text-xl text-foreground mb-2">{winner.username}</div>
                  <div className="text-profit font-bold text-lg">
                    +{winner.pnl.toFixed(1)}% PnL
                  </div>
                  <div className="text-profit font-bold text-lg">
                    Prize Pool: ${totalPot.toLocaleString()}
                  </div>
                </motion.div>
              )}

              {/* Leaderboard */}
              <motion.div
                className="bg-card border border-border rounded-lg p-4 mb-6"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <h3 className="text-lg font-bold text-foreground mb-4">Final Leaderboard</h3>
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((player, index) => (
                    <div key={player.username} className="flex items-center justify-between p-2 rounded">
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">#{index + 1}</span>
                        <span className="text-foreground">{player.username}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          player.position === 'Long' ? 'bg-profit/20 text-profit' : 'bg-loss/20 text-loss'
                        }`}>
                          {player.position}
                        </span>
                      </div>
                      <span className={`font-bold ${player.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                        {player.pnl >= 0 ? '+' : ''}{player.pnl.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Results will be shown for 10 seconds...
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
