import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const Header = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [level] = useState(42);
  const [xp] = useState(78);
  const [coins] = useState(13847);

  return (
    <header className="relative flex items-center justify-between p-4 bg-card border-b-2 border-primary/50 retro-scanlines">
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-pulse"></div>
      
      <div className="relative flex items-center space-x-6">
        {/* Game Logo - levs.fun */}
        <motion.div 
          className="flex items-center space-x-3"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center space-x-1">
            {/* Main logo image */}
            <img 
              src="/levs-logo-hori.png" 
              alt="levs.fun Logo" 
              className="h-12 w-auto object-contain"
            />
          </div>
          
          <div className="px-2 py-1 bg-levelGold/20 border border-levelGold rounded-md">
            <span className="text-xs font-pixel text-levelGold font-bold">BETA v1.0</span>
          </div>
        </motion.div>



   
      </div>
      
      {/* Connection Status & Wallet */}
      <div className="relative flex items-center space-x-3">
        {/* Online Players Count */}
        

        {/* Wallet Connect Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            variant="outline"
            className={`px-4 py-2 font-pixel text-xs font-semibold transition-all border-primary/40 bg-background/80 hover:bg-primary/10 ${
              isConnected
                ? 'text-success border-success/60'
                : 'text-connectBlue border-connectBlue/40'
            }`}
            onClick={() => setIsConnected(!isConnected)}
          >
            {isConnected ? (
              <div className="flex items-center space-x-1">
                <span className="text-success">🔗 Connected</span>
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span className="text-connectBlue">Connect Wallet</span>
              </div>
            )}
          </Button>
        </motion.div>
      </div>
    </header>
  );
};