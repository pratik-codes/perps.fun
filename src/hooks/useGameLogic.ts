import { useState, useEffect, useCallback } from "react";

export type RoundType = {
  name: string;
  duration: number;
  crashProbabilityMultiplier: number;
  description: string;
};

export const ROUND_TYPES: RoundType[] = [
  {
    name: "SOL Arena",
    duration: 300,
    crashProbabilityMultiplier: 1.0,
    description: "5-minute SOL perpetuals arena"
  }
];

export type GameState = 'initial_countdown' | 'active' | 'ended' | 'between_rounds_countdown';

export const useGameLogic = () => {
  const [solPrice, setSolPrice] = useState(180.45);
  const [gameState, setGameState] = useState<GameState>('initial_countdown');
  const [arenaTimer, setArenaTimer] = useState(60);
  const [countdownTimer, setCountdownTimer] = useState(10);
  const [currentRound, setCurrentRound] = useState(0);
  const [roundType, setRoundType] = useState<RoundType>(ROUND_TYPES[0]);
  const [winner, setWinner] = useState<{username: string, pnl: number, winnings: number} | null>(null);
  const [leaderboard, setLeaderboard] = useState<Array<{username: string, position: string, pnl: number}>>([]);
  const [totalPot, setTotalPot] = useState(12847.23);
  const [userPosition, setUserPosition] = useState<{
    type: 'Long' | 'Short';
    entryPrice: number;
    size: number;
    leverage: number;
    pnl: number;
    liquidationPrice: number;
  } | null>(null);
  const [tradeMarkers, setTradeMarkers] = useState<Array<{
    id: string;
    username: string;
    type: 'Long' | 'Short';
    price: number;
    leverage: number;
    timestamp: number;
  }>>([]);
  
  // SOL price simulation
  useEffect(() => {
    if (gameState !== 'active') return;

    const interval = setInterval(() => {
      setSolPrice(prev => {
        // SOL price volatility simulation
        const change = (Math.random() - 0.5) * 2; // -1 to +1
        const volatility = 0.5; // 0.5% max change per tick
        const newPrice = prev + (prev * (change * volatility / 100));
        return Math.max(newPrice, 1); // Minimum $1
      });
    }, 200);

    return () => clearInterval(interval);
  }, [gameState]);

  // Initial countdown timer
  useEffect(() => {
    if (gameState !== 'initial_countdown' && gameState !== 'between_rounds_countdown') return;

    const timer = setInterval(() => {
      setCountdownTimer(prev => {
        if (prev <= 1) {
          // Start the arena
          setGameState('active');
          setArenaTimer(60);
          setCountdownTimer(10);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Arena timer
  useEffect(() => {
    if (gameState !== 'active') return;

    const timer = setInterval(() => {
      setArenaTimer(prev => {
        if (prev <= 1) {
          // Arena ends - close all positions
          setGameState('ended');
          
          // Generate final leaderboard
          const players = ['SolKing', 'DegenApe', 'PerpMaster', 'LongBoi', 'ShortSqueeze', 'DiamondHands'];
          const finalLeaderboard = players.map(username => {
            const position = Math.random() > 0.5 ? 'Long' : 'Short';
            const pnl = (Math.random() - 0.5) * 200; // -100% to +100%
            return { username, position, pnl };
          }).sort((a, b) => b.pnl - a.pnl);
          
          setLeaderboard(finalLeaderboard);
          
          // Set winner (highest PnL)
          if (finalLeaderboard.length > 0) {
            const topPlayer = finalLeaderboard[0];
            setWinner({ 
              username: topPlayer.username, 
              pnl: topPlayer.pnl,
              winnings: parseFloat((Math.random() * 100 + 50).toFixed(3))
            });
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Handle game state transitions after results
  useEffect(() => {
    if (gameState === 'ended') {
      // Show results for 10 seconds, then transition to between rounds countdown
      const resultsTimer = setTimeout(() => {
        setGameState('between_rounds_countdown');
        setCountdownTimer(10);
      }, 10000);

      return () => clearTimeout(resultsTimer);
    }
  }, [gameState]);

  // Reset game state between rounds
  useEffect(() => {
    if (gameState === 'between_rounds_countdown') {
      setWinner(null);
      setUserPosition(null);
      setTradeMarkers([]);
      setTotalPot(12847.23);
    }
  }, [gameState]);

  // Update user position PnL
  useEffect(() => {
    if (userPosition && gameState === 'active') {
      const priceDiff = solPrice - userPosition.entryPrice;
      const multiplier = userPosition.type === 'Long' ? 1 : -1;
      const pnlPercent = (priceDiff / userPosition.entryPrice) * multiplier * userPosition.leverage * 100;
      
      setUserPosition(prev => prev ? { ...prev, pnl: pnlPercent } : null);
      
      // Check liquidation (simplified: -90% loss)
      if (pnlPercent <= -90) {
        setUserPosition(null); // Liquidated
      }
    }
  }, [solPrice, userPosition, gameState]);

  // Generate random trade markers with realistic trading behavior
  useEffect(() => {
    if (gameState !== 'active') return;

    const interval = setInterval(() => {
      if (Math.random() < 0.25) { // 25% chance
        const traders = [
          'SolKing', 'DegenApe', 'PerpMaster', 'LongBoi', 'ShortSqueeze', 
          'DiamondHands', 'CryptoNinja', 'TradingBot', 'MoonBoy', 'ChadTrader',
          'PumpChaser', 'DipBuyer', 'YieldFarmer', 'WhaleAlert'
        ];
        const username = traders[Math.floor(Math.random() * traders.length)];
        
        // Bias towards Long when price is rising, Short when falling
        const priceDirection = Math.random() > 0.5 ? 1 : -1;
        const longBias = priceDirection > 0 ? 0.65 : 0.35;
        const type = Math.random() < longBias ? 'Long' : 'Short';
        
        // More realistic leverage distribution
        const leverageWeights = [2, 2, 5, 5, 10, 10, 25]; // Lower leverage more common
        const leverage = leverageWeights[Math.floor(Math.random() * leverageWeights.length)];
        
        const newMarker = {
          id: Math.random().toString(36),
          username,
          type: type as 'Long' | 'Short',
          price: solPrice,
          leverage,
          timestamp: Date.now()
        };

        setTradeMarkers(prev => [...prev.slice(-10), newMarker]);
        
        // Add realistic pot increase based on leverage and position size
        const positionSize = leverage * (Math.random() * 200 + 50);
        setTotalPot(prev => prev + positionSize);
      }
    }, Math.random() * 4000 + 2000); // 2-6 seconds

    return () => clearInterval(interval);
  }, [gameState, solPrice]);

  const openLong = useCallback((size: number, leverage: number) => {
    if (gameState === 'active' && !userPosition) {
      const liquidationPrice = solPrice * (1 - 0.9 / leverage); // 90% loss = liquidation
      
      setUserPosition({
        type: 'Long',
        entryPrice: solPrice,
        size,
        leverage,
        pnl: 0,
        liquidationPrice
      });

      // Add user trade marker
      const userMarker = {
        id: 'user-' + Date.now(),
        username: 'You',
        type: 'Long' as const,
        price: solPrice,
        leverage,
        timestamp: Date.now()
      };
      setTradeMarkers(prev => [...prev.slice(-8), userMarker]);
      setTotalPot(prev => prev + size);
      
      console.log(`Opened Long position: $${size} at $${solPrice.toFixed(2)} with ${leverage}x leverage`);
    }
  }, [gameState, solPrice, userPosition]);

  const openShort = useCallback((size: number, leverage: number) => {
    if (gameState === 'active' && !userPosition) {
      const liquidationPrice = solPrice * (1 + 0.9 / leverage); // 90% loss = liquidation
      
      setUserPosition({
        type: 'Short',
        entryPrice: solPrice,
        size,
        leverage,
        pnl: 0,
        liquidationPrice
      });

      // Add user trade marker
      const userMarker = {
        id: 'user-' + Date.now(),
        username: 'You',
        type: 'Short' as const,
        price: solPrice,
        leverage,
        timestamp: Date.now()
      };
      setTradeMarkers(prev => [...prev.slice(-8), userMarker]);
      setTotalPot(prev => prev + size);
      
      console.log(`Opened Short position: $${size} at $${solPrice.toFixed(2)} with ${leverage}x leverage`);
    }
  }, [gameState, solPrice, userPosition]);

  return {
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
    // Legacy support for existing components
    isArenaActive: gameState === 'active',
    arenaEnded: gameState === 'ended',
  };
};