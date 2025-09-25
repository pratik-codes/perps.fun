import { Badge } from "@/components/ui/badge";

interface MiniChart {
  multiplier: string;
  isPositive: boolean;
  bars: { high: number; low: number; isGreen: boolean }[];
}

export const StatsBar = () => {
  const recentGames = [
    { multiplier: "2x", count: 35, color: "bg-muted" },
    { multiplier: "10x", count: 4, color: "bg-levelGold" },
    { multiplier: "50x", count: 1, color: "bg-levelGold" },
  ];

  const recentResults: MiniChart[] = [
    {
      multiplier: "1.09x",
      isPositive: false,
      bars: [
        { high: 0.8, low: 0.2, isGreen: true },
        { high: 0.9, low: 0.3, isGreen: true },
        { high: 0.7, low: 0.1, isGreen: false },
      ]
    },
    {
      multiplier: "1.30x", 
      isPositive: true,
      bars: [
        { high: 0.6, low: 0.1, isGreen: true },
        { high: 0.9, low: 0.3, isGreen: true },
        { high: 0.8, low: 0.4, isGreen: true },
      ]
    },
    {
      multiplier: "1.00x",
      isPositive: false,
      bars: [
        { high: 0.8, low: 0.3, isGreen: true },
        { high: 0.5, low: 0.1, isGreen: false },
        { high: 0.3, low: 0.05, isGreen: false },
      ]
    },
    {
      multiplier: "1.04x",
      isPositive: true,
      bars: [
        { high: 0.7, low: 0.2, isGreen: true },
        { high: 0.9, low: 0.4, isGreen: true },
        { high: 0.6, low: 0.3, isGreen: false },
      ]
    },
    {
      multiplier: "1.22x",
      isPositive: true,
      bars: [
        { high: 0.5, low: 0.1, isGreen: true },
        { high: 0.8, low: 0.3, isGreen: true },
        { high: 0.9, low: 0.5, isGreen: true },
      ]
    },
    {
      multiplier: "1.23x",
      isPositive: true,
      bars: [
        { high: 0.6, low: 0.2, isGreen: true },
        { high: 0.7, low: 0.3, isGreen: true },
        { high: 0.8, low: 0.4, isGreen: true },
      ]
    },
    {
      multiplier: "1.14x",
      isPositive: true,
      bars: [
        { high: 0.7, low: 0.1, isGreen: true },
        { high: 0.6, low: 0.2, isGreen: false },
        { high: 0.8, low: 0.4, isGreen: true },
      ]
    },
    {
      multiplier: "1.60x",
      isPositive: true,
      bars: [
        { high: 0.4, low: 0.1, isGreen: true },
        { high: 0.7, low: 0.2, isGreen: true },
        { high: 0.9, low: 0.5, isGreen: true },
      ]
    },
    {
      multiplier: "1.00x",
      isPositive: false,
      bars: [
        { high: 0.8, low: 0.2, isGreen: true },
        { high: 0.6, low: 0.1, isGreen: false },
        { high: 0.2, low: 0.05, isGreen: false },
      ]
    },
    {
      multiplier: "1.21x",
      isPositive: true,
      bars: [
        { high: 0.5, low: 0.2, isGreen: true },
        { high: 0.8, low: 0.3, isGreen: true },
        { high: 0.7, low: 0.4, isGreen: false },
      ]
    }
  ];

  const MiniCandlestickChart = ({ chart }: { chart: MiniChart }) => (
    <div className="flex flex-col items-center space-y-1">
      <div className="flex items-end space-x-0.5 h-8">
        {chart.bars.map((bar, index) => (
          <div key={index} className="flex flex-col items-center" style={{ width: '3px' }}>
            <div
              className={`w-0.5 ${bar.isGreen ? 'bg-chartGreen' : 'bg-chartRed'}`}
              style={{ height: `${bar.high * 24}px` }}
            />
            <div
              className={`w-1 ${bar.isGreen ? 'bg-chartGreen' : 'bg-chartRed'}`}
              style={{ height: `${(bar.high - bar.low) * 24}px` }}
            />
          </div>
        ))}
      </div>
      <Badge
        variant="outline"
        className={`text-xs ${
          chart.isPositive 
            ? 'text-profit border-profit' 
            : 'text-loss border-loss'
        }`}
      >
        {chart.multiplier}
      </Badge>
    </div>
  );

  return (
    <>
      {/* Notification Bar */}
      {/* <div className="bg-notificationRed text-white px-4 py-2 text-sm">
        <div className="flex items-center justify-center space-x-2">
          <span>⚠️</span>
          <span>372ms</span>
          <span>Unstable connection may delay trades</span>
        </div>
      </div> */}

      {/* Stats Bar */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between">
          {/* Last 100 Games */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Last 100</span>
            
            <div className="flex items-center space-x-2">
              {recentGames.map((game, index) => (
                <div key={index} className="flex items-center space-x-1">
                  <div className={`w-8 h-8 rounded-full ${game.color} flex items-center justify-center`}>
                    <span className="text-xs font-bold text-white">{game.multiplier}</span>
                  </div>
                  <span className="text-sm font-bold">{game.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Results with Mini Charts */}
          <div className="flex items-center space-x-2">
            {recentResults.map((chart, index) => (
              <MiniCandlestickChart key={index} chart={chart} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};