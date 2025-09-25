import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface GameControlsProps {
  onLong: (size: number, leverage: number) => void;
  onShort: (size: number, leverage: number) => void;
  balance: number;
  leverage: number;
  onLeverageChange: (leverage: number) => void;
  isArenaActive: boolean;
  currentPosition?: {
    type: 'Long' | 'Short';
    entryPrice: number;
    size: number;
    leverage: number;
    pnl: number;
    liquidationPrice: number;
  };
}

export const GameControls = ({ onLong, onShort, balance, leverage, onLeverageChange, isArenaActive, currentPosition }: GameControlsProps) => {
  const [positionSize, setPositionSize] = useState(50.00);
  const [sizePercent, setSizePercent] = useState([10]);
  const [selectedEntry, setSelectedEntry] = useState<'percent' | 'fixed'>('fixed');
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const sizePercentages = [10, 25, 50, 100];
  const fixedEntries = [10, 25, 50, 100, 250];
  const leverageOptions = [2, 5, 10, 25, 50];

  const handleSizePercentChange = (percent: number) => {
    setSizePercent([percent]);
    setPositionSize((balance * percent) / 100);
    setSelectedEntry('percent');
  };

  const handleFixedEntryChange = (amount: number) => {
    setPositionSize(amount);
    setSelectedEntry('fixed');
  };

  const handleLong = () => {
    const size = positionSize;
    if (size > 0 && size <= balance) {
      onLong(size, leverage);
      setIsSheetOpen(false);
    }
  };

  const handleShort = () => {
    const size = positionSize;
    if (size > 0 && size <= balance) {
      onShort(size, leverage);
      setIsSheetOpen(false);
    }
  };

  const handleQuickLong = () => {
    if (positionSize <= balance) {
      onLong(positionSize, leverage);
    }
  };

  const handleQuickShort = () => {
    if (positionSize <= balance) {
      onShort(positionSize, leverage);
    }
  };

  return (
    <div className="p-3 mb-20 bg-card border-t border-border">
      {/* Active Position Display */}
      {currentPosition && (
        <div className="mb-3 p-2 bg-primary/10 rounded border border-primary/30">
          <div className="flex justify-between items-center text-sm">
            <span className="text-primary font-medium">🎯 {currentPosition.type} Active</span>
            <div className="text-right">
              <div className={`font-bold ${currentPosition.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                {currentPosition.pnl >= 0 ? '+' : ''}{currentPosition.pnl.toFixed(1)}%
              </div>
              <div className={`text-xs font-medium ${currentPosition.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                {currentPosition.pnl >= 0 ? '+' : ''}${((currentPosition.size * currentPosition.pnl) / 100).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            ${currentPosition.size.toFixed(0)} @ {currentPosition.leverage}x • Entry: ${currentPosition.entryPrice.toFixed(2)}
          </div>
        </div>
      )}

      {/* Compact Trading Interface */}
      {!currentPosition && (
        <div className="space-y-3">
          {/* Trading Controls in One Row */}
          <div className="flex items-center space-x-2">
            <Button
              className="flex-1 h-10 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold"
              onClick={handleQuickLong}
              disabled={!isArenaActive || positionSize <= 0 || positionSize > balance || !!currentPosition}
            >
              📈 LONG
            </Button>
            
            <Button
              className="flex-1 h-10 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold"
              onClick={handleQuickShort}
              disabled={!isArenaActive || positionSize <= 0 || positionSize > balance || !!currentPosition}
            >
              📉 SHORT
            </Button>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  className="h-10 px-3 border-primary/50 hover:bg-primary/10"
                >
                  ⚙️
                </Button>
              </SheetTrigger>
              
              <SheetContent side="right" className="w-96 sm:w-96 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-xl font-bold text-primary">
                    ⚙️ Trading Settings
                  </SheetTitle>
                  <SheetDescription>
                    Customize your entry size and leverage
                  </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6 pb-6">
                  {/* Balance Info */}
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                    <span className="text-sm text-muted-foreground">Available Balance:</span>
                    <span className="text-lg font-bold text-profit">${balance.toFixed(2)}</span>
                  </div>

                  {/* Entry Amount */}
                  <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                    <div className="text-center text-sm font-bold text-primary mb-3">
                      💰 ENTRY AMOUNT
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-2">⚡ Fixed Amount</div>
                        <div className="grid grid-cols-3 gap-2">
                          {fixedEntries.slice(0, 6).map((amount) => (
                            <Button
                              key={amount}
                              variant={selectedEntry === 'fixed' && positionSize === amount ? "default" : "outline"}
                              size="sm"
                              className={`h-8 text-xs font-bold ${
                                selectedEntry === 'fixed' && positionSize === amount 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'hover:bg-primary/20'
                              }`}
                              onClick={() => handleFixedEntryChange(amount)}
                            >
                              ${amount}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-muted-foreground mb-2">📊 % of Balance</div>
                        <div className="grid grid-cols-4 gap-2">
                          {sizePercentages.map((percent) => (
                            <Button
                              key={percent}
                              variant={selectedEntry === 'percent' && sizePercent[0] === percent ? "default" : "outline"}
                              size="sm"
                              className={`h-8 text-xs ${
                                selectedEntry === 'percent' && sizePercent[0] === percent 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'hover:bg-primary/20'
                              }`}
                              onClick={() => handleSizePercentChange(percent)}
                            >
                              {percent}%
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="text-center text-sm bg-background/80 p-3 rounded">
                        Selected: <span className="font-bold text-primary">${positionSize.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Leverage Selection */}
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <div className="text-center text-sm font-bold text-orange-600 mb-3">
                      🔥 LEVERAGE
                    </div>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-5 gap-2">
                        {leverageOptions.map((lev) => (
                          <Button
                            key={lev}
                            variant={leverage === lev ? "default" : "outline"}
                            size="sm"
                            className={`h-8 text-xs font-bold ${
                              leverage === lev 
                                ? 'bg-orange-500 text-white' 
                                : 'hover:bg-orange-500/20 border-orange-300'
                            }`}
                            onClick={() => onLeverageChange(lev)}
                          >
                            {lev}x
                          </Button>
                        ))}
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Slider
                          value={[leverage]}
                          onValueChange={(value) => onLeverageChange(value[0])}
                          max={100}
                          min={2}
                          step={1}
                          className="flex-1"
                        />
                        <div className="text-right">
                          <div className="text-xl font-bold text-orange-500">{leverage}x</div>
                        </div>
                      </div>
                      
                      <div className="bg-background/80 p-3 rounded space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Position Value:</span>
                          <span className="font-bold text-primary">${(positionSize * leverage).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Liquidation Risk:</span>
                          <span className="font-bold text-loss">-{(90/leverage).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Execute Trade */}
                  <div className="p-4 bg-gradient-to-br from-green-500/10 via-red-500/10 to-primary/10 border-2 border-primary/40 rounded-lg">
                    <div className="text-center text-lg font-bold text-primary mb-4">
                      ⚔️ EXECUTE TRADE
                    </div>
                    
                    <div className="space-y-4">
                      {/* Order Summary */}
                      <div className="bg-background/80 p-3 rounded-lg border">
                        <div className="text-center text-sm font-bold text-muted-foreground mb-2">ORDER SUMMARY</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-muted-foreground">Entry</div>
                            <div className="font-bold text-primary">${positionSize.toFixed(2)}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Leverage</div>
                            <div className="font-bold text-orange-500">{leverage}x</div>
                          </div>
                          <div className="text-center">
                            <div className="text-muted-foreground">Position Value</div>
                            <div className="font-bold text-primary">${(positionSize * leverage).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Execute Buttons */}
                      <div className="flex space-x-3">
                        <Button
                          className="flex-1 h-16 bg-gradient-to-br from-emerald-500 via-green-500 to-green-600 hover:from-emerald-600 hover:via-green-600 hover:to-green-700 text-white font-bold text-lg shadow-xl border-2 border-emerald-400"
                          onClick={handleLong}
                          disabled={!isArenaActive || positionSize <= 0 || positionSize > balance || !!currentPosition}
                        >
                          <div className="flex flex-col items-center">
                            <span className="font-black">LONG</span>
                            <span className="text-xs">{leverage}x</span>
                          </div>
                        </Button>
                        
                        <Button
                          className="flex-1 h-16 bg-gradient-to-br from-red-500 via-rose-500 to-red-600 hover:from-red-600 hover:via-rose-600 hover:to-red-700 text-white font-bold text-lg shadow-xl border-2 border-red-400"
                          onClick={handleShort}
                          disabled={!isArenaActive || positionSize <= 0 || positionSize > balance || !!currentPosition}
                        >
                          <div className="flex flex-col items-center">
                            <span className="font-black">SHORT</span>
                            <span className="text-xs">{leverage}x</span>
                          </div>
                        </Button>
                      </div>

                      {(positionSize <= 0 || positionSize > balance) && (
                        <div className="text-center p-3 bg-orange-500/20 border border-orange-500/50 rounded-lg">
                          <div className="text-sm font-bold text-orange-700 mb-1">⚠️ Cannot Place Order</div>
                          <div className="text-xs text-muted-foreground">
                            {positionSize <= 0 && "Select an entry amount first!"}
                            {positionSize > balance && `Insufficient balance! Max: $${balance.toFixed(2)}`}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Trade Info */}
          <div className="flex justify-between items-center text-xs bg-background/50 p-2 rounded">
            <span className="text-muted-foreground">Entry: ${positionSize.toFixed(2)} • {leverage}x • Balance: ${balance.toFixed(2)}</span>
            <span className="text-primary font-bold">${(positionSize * leverage).toFixed(2)} value</span>
          </div>
        </div>
      )}

      {/* Position Active State */}
      {currentPosition && (
        <div className="text-center text-xs text-muted-foreground">
          Position active - Close when arena ends to claim rewards
        </div>
      )}
    </div>
  );
};