import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Candlestick {
  open: number;
  high: number;
  low: number;
  close: number;
  time: number;
  age: number; // How long this candle has been active (for growth animation)
}

interface TradeAction {
  id: string;
  username: string;
  action: 'buy' | 'sell';
  amount: number;
  x: number;
  y: number;
  timestamp: number;
}

interface GroupedTrade {
  id: string;
  type: 'Long' | 'Short';
  price: number;
  count: number;
  usernames: string[];
  timestamp: number;
  x: number;
  y: number;
}

interface GameChartProps {
  solPrice: number;
  isArenaActive: boolean;
  arenaTimer: number;
  totalPot: number;
  tradeMarkers: Array<{
    id: string;
    username: string;
    type: 'Long' | 'Short';
    price: number;
    leverage: number;
    timestamp: number;
  }>;
  onLongAction?: (amount: number) => void;
  onShortAction?: (amount: number) => void;
}

export const GameChart = ({ solPrice, isArenaActive, arenaTimer, totalPot, tradeMarkers, onLongAction, onShortAction }: GameChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [candlesticks, setCandlesticks] = useState<Candlestick[]>([
    { open: 180.45, high: 180.45, low: 180.45, close: 180.45, time: Date.now(), age: 0 }
  ]);
  const [groupedTrades, setGroupedTrades] = useState<GroupedTrade[]>([]);
  const [tradeActions, setTradeActions] = useState<TradeAction[]>([]);
  const [previousArenaActive, setPreviousArenaActive] = useState(isArenaActive);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [maxCandlesHistory] = useState(200); // Keep 200 candles in history
  const [latestCandleX, setLatestCandleX] = useState(0);

  // Add random trade actions for simulation
  useEffect(() => {
    if (!isArenaActive) return;

    const interval = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance of trade action
        const canvas = canvasRef.current;
        if (!canvas) return;

        const names = ['SolKing', 'DegenApe', 'PerpMaster', 'LongBoi', 'ShortSqueeze'];
        const username = names[Math.floor(Math.random() * names.length)];
        const action = Math.random() > 0.5 ? 'buy' : 'sell';
        const amount = parseFloat((Math.random() * 5).toFixed(1));
        
        const newAction: TradeAction = {
          id: Math.random().toString(36),
          username,
          action,
          amount,
          x: Math.random() * (canvas.offsetWidth - 100) + 50,
          y: Math.random() * (canvas.offsetHeight - 100) + 50,
          timestamp: Date.now()
        };

        setTradeActions(prev => [...prev.slice(-5), newAction]);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isArenaActive]);

  // Clean up old trade actions
  useEffect(() => {
    const cleanup = setInterval(() => {
      setTradeActions(prev => 
        prev.filter(action => Date.now() - action.timestamp < 3000)
      );
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // Draw vertical grid lines in chart area only
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.3;
    
    const chartMarginLeft = 80;
    const chartMarginRight = 100;
    const chartWidth = canvas.offsetWidth - chartMarginLeft - chartMarginRight;
    
    // Vertical lines
    for (let i = 0; i <= 10; i++) {
      const x = chartMarginLeft + (i * (chartWidth / 10));
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.offsetHeight);
      ctx.stroke();
    }

    // Calculate price range with padding for trade markers
    const candleMaxPrice = Math.max(...candlesticks.map(c => c.high));
    const candleMinPrice = Math.min(...candlesticks.map(c => c.low));
    const tradeMaxPrice = tradeMarkers.length > 0 ? Math.max(...tradeMarkers.map(m => m.price)) : candleMaxPrice;
    const tradeMinPrice = tradeMarkers.length > 0 ? Math.min(...tradeMarkers.map(m => m.price)) : candleMinPrice;
    
    const maxPrice = Math.max(candleMaxPrice, tradeMaxPrice);
    const minPrice = Math.min(candleMinPrice, tradeMinPrice);
    const baseRange = maxPrice - minPrice || 1;
    
    // Add 10% padding to ensure markers are visible
    const padding = baseRange * 0.1;
    const paddedMaxPrice = maxPrice + padding;
    const paddedMinPrice = minPrice - padding;
    const range = paddedMaxPrice - paddedMinPrice;
    
    // Draw price labels
    ctx.fillStyle = '#666';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    
    for (let i = 0; i <= 8; i++) {
      const price = paddedMinPrice + (range * i / 8);
      const y = canvas.offsetHeight - (i * (canvas.offsetHeight / 8));
      ctx.fillText(`$${price.toFixed(2)}`, 10, y + 4);
      
      // Draw horizontal grid line across chart area only
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 0.3;
      ctx.beginPath();
      ctx.moveTo(75, y);
      ctx.lineTo(canvas.offsetWidth - 95, y);
      ctx.stroke();
    }

    // Draw candlesticks
    if (candlesticks.length > 0) {
      const chartMarginLeft = 80; // Space for price labels
      const chartMarginRight = 100; // Space for trade markers
      const chartWidth = canvas.offsetWidth - chartMarginLeft - chartMarginRight;
      const chartCenterX = chartMarginLeft + chartWidth / 2;
      
      const candleWidth = Math.max(8, Math.min(20, chartWidth / Math.max(candlesticks.length, 12) - 2));
      const candleSpacing = candleWidth + 3;
      const maxCandlesVisible = Math.floor(chartWidth / candleSpacing);
      const startIndex = Math.max(0, candlesticks.length - maxCandlesVisible);
      const visibleCandles = candlesticks.slice(startIndex);
      
      // Calculate starting position to center the candles
      const totalCandlesWidth = visibleCandles.length * candleSpacing;
      const startX = Math.max(chartMarginLeft, chartCenterX - totalCandlesWidth / 2);
      
      visibleCandles.forEach((candle, index) => {
        const actualIndex = startIndex + index;
        const x = startX + (index * candleSpacing) + candleWidth/2;
        
        // Store latest candle X position for trade markers
        if (actualIndex === candlesticks.length - 1) {
          setLatestCandleX(x);
        }
        
        const openY = canvas.offsetHeight - ((candle.open - paddedMinPrice) / range) * canvas.offsetHeight;
        const closeY = canvas.offsetHeight - ((candle.close - paddedMinPrice) / range) * canvas.offsetHeight;
        const highY = canvas.offsetHeight - ((candle.high - paddedMinPrice) / range) * canvas.offsetHeight;
        const lowY = canvas.offsetHeight - ((candle.low - paddedMinPrice) / range) * canvas.offsetHeight;
        
        const isGreen = candle.close >= candle.open;
        const isCurrentCandle = actualIndex === candlesticks.length - 1;
        
        // Smooth multi-stage animation for new candles
        const rawProgress = isCurrentCandle ? Math.min(1, candle.age / 1500) : 1;
        const wickProgress = easeOutCubic(Math.min(1, candle.age / 600));
        const bodyProgress = easeInOutQuad(Math.min(1, Math.max(0, (candle.age - 300) / 900)));
        const opacityProgress = Math.min(1, candle.age / 200);
        
        // Calculate animated positions for current candle
        const animatedHighY = isCurrentCandle ? 
          openY - (openY - highY) * wickProgress : highY;
        const animatedLowY = isCurrentCandle ? 
          openY + (lowY - openY) * wickProgress : lowY;
        const animatedCloseY = isCurrentCandle ? 
          openY + (closeY - openY) * bodyProgress : closeY;
        
        // Draw wick with smooth thickness animation and opacity
        const wickAlpha = isCurrentCandle ? opacityProgress : 1;
        ctx.strokeStyle = isGreen ? `rgba(0, 255, 136, ${wickAlpha})` : `rgba(255, 68, 68, ${wickAlpha})`;
        const wickThickness = isCurrentCandle ? 
          Math.max(0.5, 2 * wickProgress) : 2;
        ctx.lineWidth = wickThickness;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, animatedHighY);
        ctx.lineTo(x, animatedLowY);
        ctx.stroke();
        
        // Draw body with rounded corners, smooth animation, and opacity
        const bodyAlpha = isCurrentCandle ? opacityProgress : 1;
        ctx.fillStyle = isGreen ? `rgba(0, 255, 136, ${bodyAlpha})` : `rgba(255, 68, 68, ${bodyAlpha})`;
        const bodyHeight = Math.abs(animatedCloseY - openY);
        const bodyY = Math.min(openY, animatedCloseY);
        
        if (isCurrentCandle && candle.age < 400) {
          // New candle: draw as slim rounded line at open price with fade-in
          const slimWidth = Math.max(1, candleWidth * bodyProgress * 0.4);
          drawRoundedRect(ctx, x - slimWidth/2, openY - 1.5, slimWidth, 3, 1.5);
        } else if (bodyHeight < 4) {
          // Draw rounded line for doji with proper minimum height
          const minHeight = Math.max(3, bodyHeight);
          drawRoundedRect(ctx, x - candleWidth/2, bodyY, candleWidth, minHeight, 2);
        } else {
          // Animate body width and height with smooth easing
          const bodyWidth = isCurrentCandle ?
            candleWidth * bodyProgress : candleWidth;
          const cornerRadius = Math.min(3, bodyWidth / 3, bodyHeight / 6);
          
          if (bodyWidth > 0 && bodyHeight > 0) {
            drawRoundedRect(ctx, x - bodyWidth/2, bodyY, bodyWidth, bodyHeight, cornerRadius);
          }
        }
        
        // Add subtle glow effect for current candle
        if (isCurrentCandle && candle.age > 200) {
          ctx.shadowColor = isGreen ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 68, 68, 0.3)';
          ctx.shadowBlur = 4 * bodyProgress;
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
        }
      });
    }

  }, [candlesticks]);

  // Helper function to draw rounded rectangle
  const drawRoundedRect = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
  };

  // Smooth easing functions for animations
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const easeOutElastic = (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  };

  // Update candle ages for animation
  useEffect(() => {
    if (!isArenaActive) return;
    
    const interval = setInterval(() => {
      setCandlesticks(prev => prev.map(candle => ({
        ...candle,
        age: Date.now() - candle.time
      })));
    }, 30); // Update every 30ms for ultra-smooth animation
    
    return () => clearInterval(interval);
  }, [isArenaActive]);

  // Update candlesticks based on SOL price
  useEffect(() => {
    if (isArenaActive) {
      setCandlesticks(prev => {
        const lastCandle = prev[prev.length - 1];
        const timeDiff = Date.now() - lastCandle.time;
        
        if (timeDiff > 4000) { // Create new candle every 4 seconds (longer for smoother animation)
          const newCandle: Candlestick = {
            open: lastCandle.close,
            high: lastCandle.close, // Start with open price
            low: lastCandle.close,  // Start with open price
            close: solPrice,
            time: Date.now(),
            age: 0
          };
          return [...prev.slice(-maxCandlesHistory), newCandle]; // Keep historical data
        } else {
          // Update current candle
          const updatedCandle = {
            ...lastCandle,
            high: Math.max(lastCandle.high, solPrice),
            low: Math.min(lastCandle.low, solPrice),
            close: solPrice,
            age: timeDiff
          };
          return [...prev.slice(0, -1), updatedCandle];
        }
      });
    }
  }, [solPrice, isArenaActive]);

  // Group trade markers by price and time to avoid overlapping
  useEffect(() => {
    const currentTime = Date.now();
    const activeMarkers = tradeMarkers.filter(marker => 
      currentTime - marker.timestamp < 5000 // Show for 5 seconds
    );
    
    // Group markers that are close in price and time
    const grouped: { [key: string]: GroupedTrade } = {};
    
    activeMarkers.forEach(marker => {
      const priceKey = Math.round(marker.price * 100) / 100; // Group by $0.01
      const timeKey = Math.floor(marker.timestamp / 1000); // Group by second
      const key = `${marker.type}-${priceKey}-${timeKey}`;
      
      if (grouped[key]) {
        grouped[key].count++;
        grouped[key].usernames.push(marker.username);
      } else {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        // Calculate position based on current candle and price (using same logic as chart)
        const canvasHeight = canvas.offsetHeight;
        const candleMaxPrice = Math.max(...candlesticks.map(c => c.high));
        const candleMinPrice = Math.min(...candlesticks.map(c => c.low));
        const tradeMaxPrice = Math.max(candleMaxPrice, marker.price);
        const tradeMinPrice = Math.min(candleMinPrice, marker.price);
        const baseRange = tradeMaxPrice - tradeMinPrice || 1;
        const padding = baseRange * 0.1;
        const paddedMaxPrice = tradeMaxPrice + padding;
        const paddedMinPrice = tradeMinPrice - padding;
        const range = paddedMaxPrice - paddedMinPrice;
        
        const y = canvasHeight - ((marker.price - paddedMinPrice) / range) * canvasHeight;
        
        // Position at the latest candle edge
        const x = latestCandleX || (canvas.offsetWidth - 100);
        
        grouped[key] = {
          id: key,
          type: marker.type,
          price: marker.price,
          count: 1,
          usernames: [marker.username],
          timestamp: marker.timestamp,
          x,
          y
        };
      }
    });
    
    setGroupedTrades(Object.values(grouped));
  }, [tradeMarkers, candlesticks]);

  // Handle arena restart - preserve some history but clear trade markers
  useEffect(() => {
    if (previousArenaActive && !isArenaActive) {
      // Arena just ended - clear trade markers but keep candlesticks
      setGroupedTrades([]);
      setTradeActions([]);
    } else if (!previousArenaActive && isArenaActive) {
      // New arena started - add separator candle and reset scroll
      setCandlesticks(prev => {
        const lastCandle = prev[prev.length - 1];
        return [...prev, {
          open: lastCandle.close,
          high: lastCandle.close,
          low: lastCandle.close,
          close: lastCandle.close,
          time: Date.now(),
          age: 0
        }];
      });
      setScrollOffset(0);
    }
    setPreviousArenaActive(isArenaActive);
  }, [isArenaActive, previousArenaActive]);

  // Auto-scroll to keep latest candles visible (centered)
  useEffect(() => {
    if (isArenaActive) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const chartMarginLeft = 80;
      const chartMarginRight = 100;
      const chartWidth = canvas.offsetWidth - chartMarginLeft - chartMarginRight;
      const candleSpacing = Math.max(6, Math.min(16, chartWidth / Math.max(candlesticks.length, 15) - 1)) + 2;
      const maxCandlesVisible = Math.floor(chartWidth / candleSpacing);
      
      // Always show the latest candles, but keep them centered when possible
      if (candlesticks.length > maxCandlesVisible) {
        setScrollOffset(candlesticks.length - maxCandlesVisible);
      } else {
        setScrollOffset(0); // Show all candles centered
      }
    }
  }, [candlesticks.length, isArenaActive]);


  return (
    <div className="relative w-full h-full bg-card rounded-lg border border-border overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
      
      {/* Total Pot Display */}
      <div className="absolute top-4 left-4">
        <motion.div className="text-2xl font-bold text-primary">
          ${totalPot.toLocaleString()}
        </motion.div>
        <div className="text-center text-sm text-muted-foreground">Total Pot</div>
      </div>

      {/* Arena Timer Display */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
        <motion.div
          className={`text-4xl font-bold ${arenaTimer <= 30 ? 'text-loss' : 'text-foreground'}`}
          animate={arenaTimer <= 30 ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {Math.floor(arenaTimer / 60)}:{(arenaTimer % 60).toString().padStart(2, '0')}
        </motion.div>
        <div className="text-center text-sm text-muted-foreground">Arena Timer</div>
      </div>

      {/* Current SOL Price Display */}
      <div className="absolute top-4 right-4">
        <motion.div className="text-3xl font-bold text-profit">
          ${solPrice.toFixed(2)}
        </motion.div>
        <div className="text-center text-sm text-muted-foreground">SOL/USDT</div>
      </div>


      {/* Trade Action Overlays */}
      <AnimatePresence>
        {tradeActions.map((action) => (
          <motion.div
            key={action.id}
            className={`absolute pointer-events-none px-3 py-1 rounded-lg text-sm font-bold ${
              action.action === 'buy' 
                ? 'bg-profit text-profit-foreground' 
                : 'bg-loss text-white'
            }`}
            style={{ left: action.x, top: action.y }}
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-xs">{action.username}</div>
            <div>
              {action.action === 'buy' ? 'LONG' : 'SHORT'} ${action.amount}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Grouped Trade Markers */}
      <AnimatePresence>
        {groupedTrades.map((trade) => (
          <motion.div
            key={trade.id}
            className={`absolute pointer-events-none px-2 py-1 rounded text-xs font-bold shadow-lg ${
              trade.type === 'Long' 
                ? 'bg-profit text-profit-foreground border border-profit/30' 
                : 'bg-loss text-white border border-loss/30'
            }`}
            style={{ 
              left: trade.x + 10, // Offset slightly from candle edge
              top: trade.y - 12, // Center vertically on price
              transform: 'translateX(0)' // Ensure no additional transforms
            }}
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {trade.count > 1 ? (
              <div className="flex items-center space-x-1">
                <span>+{trade.count} {trade.type.toUpperCase()}</span>
                <div className="text-[10px] opacity-80">
                  ${trade.price.toFixed(2)}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-1">
                <span>{trade.usernames[0]}</span>
                <span>{trade.type.toUpperCase()}</span>
                <div className="text-[10px] opacity-80">
                  ${trade.price.toFixed(2)}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Price Line for Current Trade Markers */}
      {groupedTrades.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {groupedTrades.map((trade) => (
            <motion.div
              key={`line-${trade.id}`}
              className={`absolute h-px opacity-30 ${
                trade.type === 'Long' ? 'bg-profit' : 'bg-loss'
              }`}
              style={{
                top: trade.y,
                left: 80, // Start from chart area
                width: trade.x - 70, // Extend to just before marker
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      )}

    </div>
  );
};