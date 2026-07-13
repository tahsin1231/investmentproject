import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/translations';
import { 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  HelpCircle, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Zap,
  ArrowRight
} from 'lucide-react';

interface Candlestick {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export const MarketsView: React.FC = () => {
  const { user, placeOtcTrade, resolveOtcTrade, language } = useApp();
  const t = translations[language];

  // Primary Asset
  const assetName = "BTC OTC / USDT";
  const basePrice = 64250.00;

  // Real-time time remaining in 60s round
  const [timeLeft, setTimeLeft] = useState<number>(60 - new Date().getSeconds());
  const [currentRoundId, setCurrentRoundId] = useState<number>(Math.floor(Date.now() / 60000));
  const [prevRoundId, setPrevRoundId] = useState<number>(Math.floor(Date.now() / 60000) - 1);

  // Candlesticks History
  const [candles, setCandles] = useState<Candlestick[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(basePrice);
  const [currentCandle, setCurrentCandle] = useState<Candlestick | null>(null);

  // Trade form states
  const [tradeAmount, setTradeAmount] = useState<string>('50');
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTrade, setActiveTrade] = useState<{ amount: number; side: 'buy' | 'sell'; roundId: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Settlement Status Display Modal
  const [settlementResult, setSettlementResult] = useState<{
    roundId: number;
    outcome: 'buy' | 'sell';
    won: boolean;
    refund: boolean;
    amount: number;
    show: boolean;
  } | null>(null);

  // AI Mini-App system states
  const [aiOpen, setAiOpen] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  // Generate unique custom AI analysis tailored for this user ("vino vino analysis")
  const userAiAnalysis = useMemo(() => {
    if (!user) return null;
    
    // Seed based on user email hash and current round to make it change every minute but remain consistent per minute
    const emailStr = user.email || "guest@gmail.com";
    let seed = 0;
    for (let i = 0; i < emailStr.length; i++) {
      seed += emailStr.charCodeAt(i);
    }
    // Add roundId
    seed += currentRoundId;

    // Asymmetric percentages
    const buyPct = 30 + (seed % 35); // 30% to 65%
    const sellPct = 100 - buyPct;

    // Different analysis texts to keep it "vino vino" (customized)
    const analysisPool = [
      "AI telemetry has identified high-frequency selling pressure within the order book. SELL is oversaturated. The system recommendation favors the opposite BUY (Green) target for high-probability round victory.",
      "Quant matrix suggests intense local buying blocks driving a false bullish wick. BUY volume is disproportionately heavy. The system algorithmic hedge suggests targeting SELL (Red) for an impending correction.",
      "A sudden liquidity gap has materialized on the lower order deck. BUY is heavily favored due to immediate OTC re-routing. Suggest entering a BUY (Green) position to capture the recovery cycle.",
      "The neural grid shows heavy consolidation at the current resistance ceiling. Sell orders are heavily saturated on the server pool. Highly advise taking a minor SELL (Red) route for maximum return probability.",
      "Institutional market makers are dumping contracts on the buy-side pool. Total buy volume is excessive. System indicators highly recommend deploying on SELL (Red) to leverage the minority volume win rule."
    ];

    const textIndex = seed % analysisPool.length;
    const recommendation = buyPct < sellPct ? 'buy' : 'sell';

    return {
      buyPercentage: buyPct,
      sellPercentage: sellPct,
      recommendation,
      text: analysisPool[textIndex]
    };
  }, [user, currentRoundId]);

  // Generate initial historical candles
  useEffect(() => {
    const historicalCandles: Candlestick[] = [];
    let prevClose = basePrice - 180;
    const nowTime = Math.floor(Date.now() / 60000);

    for (let i = 15; i > 0; i--) {
      const timeStr = new Date((nowTime - i) * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const open = prevClose;
      const change = (Math.random() - 0.48) * 120;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 40;
      const low = Math.min(open, close) - Math.random() * 40;

      historicalCandles.push({
        time: timeStr,
        open,
        high,
        low,
        close
      });
      prevClose = close;
    }

    setCandles(historicalCandles);
    setCurrentPrice(prevClose);
    setCurrentCandle({
      time: new Date(nowTime * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open: prevClose,
      high: prevClose,
      low: prevClose,
      close: prevClose
    });
  }, []);

  // Sync Timer countdown and handle round rollover
  useEffect(() => {
    const interval = setInterval(() => {
      const date = new Date();
      const sec = date.getSeconds();
      const newTimeLeft = 60 - sec;
      setTimeLeft(newTimeLeft);

      const round = Math.floor(Date.now() / 60000);
      if (round !== currentRoundId) {
        // Round has changed!
        setPrevRoundId(currentRoundId);
        setCurrentRoundId(round);
      }

      // Small price fluctuation within the candle (fluctuates every second)
      if (currentCandle) {
        const volatility = (Math.random() - 0.5) * 12; // fluctuation amount
        const newPrice = Number((currentPrice + volatility).toFixed(2));
        setCurrentPrice(newPrice);

        setCurrentCandle(prev => {
          if (!prev) return null;
          return {
            ...prev,
            close: newPrice,
            high: Math.max(prev.high, newPrice),
            low: Math.min(prev.low, newPrice)
          };
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPrice, currentCandle, currentRoundId]);

  // Watch round changes to commit previous candle and resolve previous round trades
  useEffect(() => {
    if (!currentCandle) return;

    // If we transition to a new round, commit the finished candle to history
    const commitAndStartNewRound = async () => {
      // 1. Add current completed candle to history
      setCandles(prev => {
        const updated = [...prev, currentCandle];
        if (updated.length > 20) {
          updated.shift(); // keep it clean
        }
        return updated;
      });

      // 2. Start a brand new candle
      const nowTime = Math.floor(Date.now() / 60000);
      const nextTimeStr = new Date(nowTime * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCurrentCandle({
        time: nextTimeStr,
        open: currentPrice,
        high: currentPrice,
        low: currentPrice,
        close: currentPrice
      });

      // 3. Auto-resolve the trade placed in the previous round
      if (activeTrade && activeTrade.roundId === prevRoundId) {
        setIsSubmitting(true);
        try {
          const res = await resolveOtcTrade(prevRoundId);
          if (res && res.success) {
            setSettlementResult({
              roundId: prevRoundId,
              outcome: res.outcome || 'buy',
              won: !!res.won,
              refund: !!res.refund,
              amount: activeTrade.amount,
              show: true
            });
            setActiveTrade(null); // Clear active trade
          }
        } catch (err) {
          console.error("Auto-settle failure", err);
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    commitAndStartNewRound();
  }, [currentRoundId]);

  // Render SVG Candlestick Chart
  const chartHeight = 260;
  const chartWidth = 500;
  const candleWidth = 16;
  const paddingRight = 60;
  const actualChartWidth = chartWidth - paddingRight;

  const candleData = useMemo(() => {
    const list = [...candles];
    if (currentCandle) {
      list.push(currentCandle);
    }
    return list;
  }, [candles, currentCandle]);

  // Compute min and max for scaling
  const priceRange = useMemo(() => {
    if (candleData.length === 0) return { min: 0, max: 100 };
    let max = -Infinity;
    let min = Infinity;
    candleData.forEach(c => {
      if (c.high > max) max = c.high;
      if (c.low < min) min = c.low;
    });
    // Add extra padding
    const padding = (max - min) * 0.15 || 10;
    return {
      min: min - padding,
      max: max + padding
    };
  }, [candleData]);

  // Scale functions
  const scaleY = (price: number) => {
    const range = priceRange.max - priceRange.min;
    if (range === 0) return chartHeight / 2;
    return chartHeight - ((price - priceRange.min) / range) * chartHeight;
  };

  const getX = (index: number) => {
    const count = candleData.length;
    if (count <= 1) return actualChartWidth / 2;
    return (index / (count - 1)) * (actualChartWidth - 40) + 20;
  };

  // Preset Amount Buttons
  const setAmountPreset = (multiplier: number) => {
    setErrorMsg(null);
    if (!user) return;
    if (multiplier === -1) {
      setTradeAmount(String(user.balance.toFixed(2)));
    } else {
      setTradeAmount(String(multiplier));
    }
  };

  // Submit Trade
  const handlePlaceTrade = async () => {
    if (!user) {
      setErrorMsg("Please log in to initiate order execution.");
      return;
    }
    setErrorMsg(null);

    const parsedAmount = parseFloat(tradeAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMsg("Please provide a valid trade amount.");
      return;
    }

    if (parsedAmount < 1) {
      setErrorMsg("Minimum required trade size is $1.00 USDT.");
      return;
    }

    if (user.balance < parsedAmount) {
      setErrorMsg("Insufficient funds in trading account. Please deposit.");
      return;
    }

    if (activeTrade) {
      setErrorMsg("You already have an active pending trade for this 1-minute round.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await placeOtcTrade(parsedAmount, tradeSide);
      if (res.success) {
        setActiveTrade({
          amount: parsedAmount,
          side: tradeSide,
          roundId: currentRoundId
        });
        setErrorMsg(null);
      } else {
        setErrorMsg(res.error || "Failed to submit order to OTC pool.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open/trigger AI Analysis Mini-App
  const handleOpenAi = () => {
    setAiLoading(true);
    setAiOpen(true);
    const timer = setTimeout(() => {
      setAiLoading(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic OTC Top Banner info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-950 border border-slate-900 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />
        
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-extrabold text-white tracking-tight">{assetName}</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-mono text-[9px] font-bold tracking-widest uppercase">
                OTC Market
              </span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono mt-0.5">
              Current Contract Round ID: #{currentRoundId}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">OTC INDEX Price</p>
            <span className="text-2xl font-black font-mono text-white tracking-tight transition-all">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="border-l border-slate-800 pl-6 h-10 flex flex-col justify-center">
            <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Timer Round</p>
            <div className="flex items-center space-x-1.5 text-emerald-400 font-mono text-lg font-black">
              <Clock className="w-4 h-4 text-emerald-500 animate-spin-slow" />
              <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Interactive Candlestick Chart Card (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-2xl p-5 shadow-xl space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 uppercase font-mono tracking-widest">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>BTC OTC Real-Time Candlestick telemetry</span>
            </div>
            <div className="flex items-center gap-2">
              {/* AI mini app trigger button */}
              <button
                onClick={handleOpenAi}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-slate-950" />
                <span>🔮 AI PREDICTION MINI-APP</span>
              </button>
            </div>
          </div>

          {/* Canvas-style Candlestick SVG element */}
          <div className="w-full relative bg-slate-950/80 border border-slate-900 rounded-xl p-2 h-[280px] overflow-hidden">
            {/* Grid line overlays for TradingView aesthetic */}
            <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 pointer-events-none opacity-5">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="border-b border-r border-white" />
              ))}
            </div>

            {/* SVG Renderer */}
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
              
              {/* Draw price horizontal helper line */}
              <line 
                x1={0} 
                y1={scaleY(currentPrice)} 
                x2={actualChartWidth} 
                y2={scaleY(currentPrice)} 
                stroke="#10b981" 
                strokeDasharray="3,3" 
                strokeOpacity={0.3} 
              />
              {/* Price text box on the right scale */}
              <text 
                x={actualChartWidth + 5} 
                y={scaleY(currentPrice) + 3} 
                fill="#10b981" 
                fontSize={8} 
                fontWeight="bold" 
                fontFamily="monospace"
              >
                ${currentPrice.toFixed(0)}
              </text>

              {/* Draw candlesticks */}
              {candleData.map((candle, idx) => {
                const x = getX(idx);
                const isGreen = candle.close >= candle.open;
                const color = isGreen ? "#10b981" : "#ef4444";

                const openY = scaleY(candle.open);
                const closeY = scaleY(candle.close);
                const highY = scaleY(candle.high);
                const lowY = scaleY(candle.low);

                const rectY = Math.min(openY, closeY);
                const rectHeight = Math.max(2, Math.abs(openY - closeY));

                return (
                  <g key={idx}>
                    {/* Wick shadow */}
                    <line 
                      x1={x} 
                      y1={highY} 
                      x2={x} 
                      y2={lowY} 
                      stroke={color} 
                      strokeWidth={1.2} 
                    />
                    {/* Candle body rect */}
                    <rect 
                      x={x - candleWidth / 2} 
                      y={rectY} 
                      width={candleWidth} 
                      height={rectHeight} 
                      fill={color} 
                      rx={1}
                    />
                    {/* Time labels below every 4 candles */}
                    {idx % 4 === 0 && (
                      <text 
                        x={x} 
                        y={chartHeight - 5} 
                        fill="#475569" 
                        fontSize={8} 
                        textAnchor="middle" 
                        fontFamily="monospace"
                      >
                        {candle.time}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 text-center">
              <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-bold">Round Start Index</span>
              <span className="text-xs font-mono font-bold text-slate-300">
                ${currentCandle ? currentCandle.open.toFixed(2) : '---'}
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 text-center">
              <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-bold">Round Peak High</span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                ${currentCandle ? currentCandle.high.toFixed(2) : '---'}
              </span>
            </div>
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 text-center">
              <span className="block text-[8px] text-slate-500 uppercase tracking-widest font-bold">Round Floor Low</span>
              <span className="text-xs font-mono font-bold text-red-400">
                ${currentCandle ? currentCandle.low.toFixed(2) : '---'}
              </span>
            </div>
          </div>

        </div>

        {/* Right Column: Place Order Form & Pending Trade View (4 cols) */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-2xl p-5 shadow-xl space-y-5 relative">
          
          <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
              OTC Order Management
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-mono text-[8px] font-bold">
              AUTHORIZED
            </span>
          </div>

          {/* Display active wallet balance */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs font-bold">
                $
              </div>
              <div>
                <p className="text-[8px] text-slate-500 uppercase font-mono font-bold tracking-wider">Trading Account Balance</p>
                <span className="text-sm font-extrabold font-mono text-white">
                  ${user ? user.balance.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'} USDT
                </span>
              </div>
            </div>
          </div>

          {/* Active Pending Trade Card */}
          {activeTrade && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono font-bold">
                <span className="text-amber-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                  PENDING ORDER ACTIVE
                </span>
                <span className="text-slate-400">Round #{activeTrade.roundId}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                <div>
                  <span className="text-[8px] text-slate-500 block">DIRECTION</span>
                  <span className={`font-bold ${activeTrade.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {activeTrade.side === 'buy' ? '🟩 BUY (GREEN)' : '🟥 SELL (RED)'}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">AMOUNT SIZE</span>
                  <span className="font-bold text-white">${activeTrade.amount.toFixed(2)} USDT</span>
                </div>
              </div>
              <p className="text-[9px] text-slate-400 uppercase leading-relaxed text-center mt-1">
                ⌛ SETTLING AT NEXT MINUTE BOUNDARY (IN {timeLeft}s)
              </p>
            </div>
          )}

          {/* Order Side Toggle Selector */}
          {!activeTrade && (
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-mono font-bold tracking-widest mb-1.5">
                  1. SELECT CONTRACT DIRECTION
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTradeSide('buy')}
                    className={`py-3 px-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                      tradeSide === 'buy'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                        : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">BUY (GREEN)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTradeSide('sell')}
                    className={`py-3 px-4 rounded-xl font-bold flex flex-col items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                      tradeSide === 'sell'
                        ? 'bg-red-500 text-slate-950 border-red-400 shadow-lg shadow-red-500/10 scale-[1.02]'
                        : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800'
                    }`}
                  >
                    <TrendingDown className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider">SELL (RED)</span>
                  </button>
                </div>
              </div>

              {/* Amount Size Inputs */}
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-mono font-bold tracking-widest mb-1.5">
                  2. SPECIFY TRANSACTION AMOUNT (USDT)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number"
                    min="1"
                    step="5"
                    disabled={isSubmitting}
                    placeholder="e.g. 50"
                    value={tradeAmount}
                    onChange={(e) => {
                      setErrorMsg(null);
                      setTradeAmount(e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500 rounded-xl py-3 pl-10 pr-4 text-sm text-white font-mono placeholder-slate-700 focus:outline-none transition-colors"
                  />
                </div>

                {/* Preset shortcuts */}
                <div className="grid grid-cols-5 gap-1.5 mt-2">
                  {[10, 50, 100, 500].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmountPreset(val)}
                      className="py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded text-[9px] font-mono font-bold tracking-wider cursor-pointer"
                    >
                      +{val}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmountPreset(-1)}
                    className="py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded text-[9px] font-mono font-bold tracking-wider cursor-pointer"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Error messages if any */}
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] p-3 rounded-lg leading-relaxed font-mono">
                  ❌ {errorMsg}
                </div>
              )}

              {/* Execution Action Button */}
              <button
                type="button"
                onClick={handlePlaceTrade}
                disabled={isSubmitting}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-900 disabled:text-slate-500 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider text-xs"
              >
                <span>{isSubmitting ? "PROCESSING TRANSACTION..." : "EXECUTE OTC TRANSACTION"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Locked telemetry info text */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-3 flex items-start space-x-2">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
            <div className="text-[9px] text-slate-500 leading-normal uppercase">
              Payout algorithm: Win yields <b>+50% net profit</b>. Lose results in 100% loss, but <b>referred sub-nodes</b> receive a automatic <b>50% contract refund</b>.
            </div>
          </div>

        </div>

      </div>

      {/* AI mini app interactive dialog overlay */}
      {aiOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative p-6 space-y-4">
            
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-5 h-5 text-amber-500 animate-pulse" />
                <span className="font-mono text-xs font-bold text-amber-500 uppercase tracking-widest">
                  AI OTC Quant Mini-App
                </span>
              </div>
              <button
                onClick={() => setAiOpen(false)}
                className="text-xs text-slate-500 hover:text-white font-mono"
              >
                [CLOSE]
              </button>
            </div>

            {aiLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-amber-500 border-slate-800 animate-spin" />
                <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider animate-pulse">
                  Decrypting block telemetry...
                </span>
              </div>
            ) : (
              <div className="space-y-4 font-mono">
                
                {/* Visual bar graph comparing Buy and Sell */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-slate-400 uppercase">
                    <span className="text-emerald-400 font-bold">Buy Target: {userAiAnalysis?.buyPercentage}%</span>
                    <span className="text-red-400 font-bold">Sell Target: {userAiAnalysis?.sellPercentage}%</span>
                  </div>
                  
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                    <div 
                      style={{ width: `${userAiAnalysis?.buyPercentage}%` }} 
                      className="h-full bg-emerald-500 transition-all" 
                    />
                    <div 
                      style={{ width: `${userAiAnalysis?.sellPercentage}%` }} 
                      className="h-full bg-red-500 transition-all" 
                    />
                  </div>
                </div>

                {/* Recommendation indicator */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-500 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Neural Analysis Output:</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed uppercase">
                    {userAiAnalysis?.text}
                  </p>
                </div>

                <div className="text-[8px] text-slate-500 leading-normal uppercase">
                  💡 *This analysis is dynamically processed for your specific user block and resets every 60 seconds.
                </div>

                <button
                  onClick={() => setAiOpen(false)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Confirm telemetry & Exit
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Outcome Settlement success/loss Modal popup */}
      {settlementResult && settlementResult.show && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-5 relative">
            
            {settlementResult.won ? (
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-bounce" />
              </div>
            ) : (
              <div className={`w-16 h-16 rounded-full ${settlementResult.refund ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'} flex items-center justify-center mx-auto`}>
                <XCircle className="w-8 h-8 animate-pulse" />
              </div>
            )}

            <div className="space-y-1.5">
              <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest block font-bold">
                Round #{settlementResult.roundId} Settle Completed
              </span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                {settlementResult.won ? '🎉 EXCEL_WINNER' : '❌ CONTRACT_EXPIRED'}
              </h3>
              <p className="text-xs text-slate-400 uppercase font-mono">
                Winning Market Candle: <span className={settlementResult.outcome === 'buy' ? 'text-emerald-400' : 'text-red-400'}>{settlementResult.outcome === 'buy' ? '🟩 BUY (GREEN)' : '🟥 SELL (RED)'}</span>
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs">
              {settlementResult.won ? (
                <div className="space-y-1 text-emerald-400 uppercase font-bold">
                  <p>Congratulations!</p>
                  <p className="text-white text-lg">+$Price Return: +{(settlementResult.amount * 1.5).toFixed(2)} USDT</p>
                  <p className="text-[9px] text-slate-500 mt-1 font-normal">You received 100% capital back + 50% net profit dividends.</p>
                </div>
              ) : (
                <div className="space-y-1 uppercase">
                  {settlementResult.refund ? (
                    <div className="text-amber-500 font-bold space-y-1">
                      <p>Trade Lost</p>
                      <p className="text-white text-lg">+$Refund: +{(settlementResult.amount * 0.5).toFixed(2)} USDT</p>
                      <p className="text-[9px] text-slate-400 mt-1 font-normal leading-relaxed">
                        💡 Since you registered with a referrer, our system automatically refunded 50% of your loss size!
                      </p>
                    </div>
                  ) : (
                    <div className="text-red-400 font-bold space-y-1">
                      <p>Trade Lost</p>
                      <p className="text-white text-lg">0% Refund: -$0.00 USDT</p>
                      <p className="text-[9px] text-slate-500 mt-1 font-normal leading-relaxed">
                        Direct account registrations do not qualify for lost trade refund program.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setSettlementResult(null)}
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-mono text-xs uppercase tracking-wider rounded-xl border border-slate-800 transition-colors cursor-pointer"
            >
              Acknowledge and Continue
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
