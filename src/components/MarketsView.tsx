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
  const [zoomLevel, setZoomLevel] = useState<number>(16); // default showing 16 visible bars

  // Drag / Scroll states for historical candle panning
  const [scrollOffset, setScrollOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStartX, setDragStartX] = useState<number>(0);
  const [dragStartOffset, setDragStartOffset] = useState<number>(0);

  // Trade form states
  const [tradeAmount, setTradeAmount] = useState<string>('50');
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeOtcTrade, setActiveOtcTrade] = useState<{
    txId: string;
    amount: number;
    side: 'buy' | 'sell';
    entryPrice: number;
    durationSeconds: number;
    secondsLeft: number;
    startTime: number;
    targetWon: boolean;
  } | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(30); // Default: 30 seconds
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const durationOptions = [
    { label: '10s', value: 10 },
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '2m', value: 120 },
    { label: '5m', value: 300 },
  ];

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

    for (let i = 149; i > 0; i--) {
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

  // Sync Timer countdown and handle round rollover + dynamic OTC trade ticking
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
        let volatility = (Math.random() - 0.5) * 12; // fluctuation amount
        let newPrice = Number((currentPrice + volatility).toFixed(2));

        // Ticking active dynamic OTC trade
        let tradeFinished = false;

        if (activeOtcTrade) {
          const nextSecondsLeft = activeOtcTrade.secondsLeft - 1;
          
          if (nextSecondsLeft <= 0) {
            tradeFinished = true;
          } else {
            // Nudge price in the last 3 seconds of the trade to align with targetWon outcome
            if (nextSecondsLeft <= 3) {
              const entry = activeOtcTrade.entryPrice;
              const win = activeOtcTrade.targetWon;
              const side = activeOtcTrade.side;

              if (side === 'buy') {
                if (win && newPrice <= entry) {
                  newPrice = Number((entry + Math.random() * 4 + 1.2).toFixed(2));
                } else if (!win && newPrice >= entry) {
                  newPrice = Number((entry - (Math.random() * 4 + 1.2)).toFixed(2));
                }
              } else { // sell
                if (win && newPrice >= entry) {
                  newPrice = Number((entry - (Math.random() * 4 + 1.2)).toFixed(2));
                } else if (!win && newPrice <= entry) {
                  newPrice = Number((entry + Math.random() * 4 + 1.2).toFixed(2));
                }
              }
            }

            // Update active trade local seconds left
            setActiveOtcTrade(prev => prev ? { ...prev, secondsLeft: nextSecondsLeft } : null);
          }
        }

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

        // Resolve finished trade
        if (tradeFinished && activeOtcTrade) {
          const finishTrade = async () => {
            const finalP = newPrice;
            const targetW = activeOtcTrade.targetWon;
            const tId = activeOtcTrade.txId;
            const amount = activeOtcTrade.amount;
            const side = activeOtcTrade.side;

            setActiveOtcTrade(null);
            setIsSubmitting(true);
            try {
              const res = await resolveOtcTrade(tId, true, targetW, finalP);
              if (res && res.success) {
                setSettlementResult({
                  roundId: 0,
                  outcome: targetW ? side : (side === 'buy' ? 'sell' : 'buy'),
                  won: targetW,
                  refund: !targetW && !!user?.referredBy,
                  amount: amount,
                  show: true
                });
              }
            } catch (err) {
              console.error("Failed to settle dynamic trade", err);
            } finally {
              setIsSubmitting(false);
            }
          };

          finishTrade();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentPrice, currentCandle, currentRoundId, activeOtcTrade, user, resolveOtcTrade]);

  // Watch round changes to commit previous candle and start a new one
  useEffect(() => {
    if (!currentCandle) return;

    // If we transition to a new round, commit the finished candle to history
    const commitAndStartNewRound = () => {
      // 1. Add current completed candle to history
      setCandles(prev => {
        const updated = [...prev, currentCandle];
        if (updated.length > 500) {
          updated.shift(); // keep it clean
        }
        return updated;
      });

      // If viewing history, keep the view offset locked
      setScrollOffset(prev => prev > 0 ? prev + 1 : 0);

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
    };

    commitAndStartNewRound();
  }, [currentRoundId]);

  // Render SVG Candlestick Chart
  const chartHeight = 260;
  const chartWidth = 500;
  const paddingRight = 60;
  const actualChartWidth = chartWidth - paddingRight;

  const candleData = useMemo(() => {
    const list = [...candles];
    if (currentCandle) {
      list.push(currentCandle);
    }
    return list;
  }, [candles, currentCandle]);

  // Sliced candle data based on zoomLevel (number of visible candles) and scrollOffset (how far back we are scrolled)
  const displayedCandleData = useMemo(() => {
    const end = candleData.length - scrollOffset;
    const start = Math.max(0, end - zoomLevel);
    return candleData.slice(start, end);
  }, [candleData, zoomLevel, scrollOffset]);

  // Compute min and max for scaling using only displayed candles
  const priceRange = useMemo(() => {
    if (displayedCandleData.length === 0) return { min: 0, max: 100 };
    let max = -Infinity;
    let min = Infinity;
    displayedCandleData.forEach(c => {
      if (c.high > max) max = c.high;
      if (c.low < min) min = c.low;
    });
    // Add extra padding
    const padding = (max - min) * 0.15 || 10;
    return {
      min: min - padding,
      max: max + padding
    };
  }, [displayedCandleData]);

  // Scale functions
  const scaleY = (price: number) => {
    const range = priceRange.max - priceRange.min;
    if (range === 0) return chartHeight / 2;
    return chartHeight - ((price - priceRange.min) / range) * chartHeight;
  };

  const getX = (index: number) => {
    const count = displayedCandleData.length;
    if (count <= 1) return actualChartWidth / 2;
    return (index / (count - 1)) * (actualChartWidth - 40) + 20;
  };

  // Dynamically calculate candle width based on zoom level to ensure visual perfection
  const candleWidth = useMemo(() => {
    const count = displayedCandleData.length;
    const calculated = (actualChartWidth / count) * 0.55;
    return Math.max(5, Math.min(32, calculated));
  }, [displayedCandleData, actualChartWidth]);

  // Mouse & Touch Drag-to-Scroll Logic
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setDragStartX(clientX);
    setDragStartOffset(scrollOffset);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    const dx = clientX - dragStartX;
    const candleSpanPixels = actualChartWidth / zoomLevel;
    // Moving finger right (dx > 0) scrolls back in time (increases scrollOffset)
    // Moving finger left (dx < 0) scrolls forward in time (decreases scrollOffset)
    const rawOffset = dragStartOffset + (dx / candleSpanPixels);
    const maxOffset = Math.max(0, candleData.length - zoomLevel);
    setScrollOffset(Math.max(0, Math.min(maxOffset, Math.round(rawOffset))));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    handleDragStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleDragMove(e.clientX);
  };

  const onMouseUpOrLeave = () => {
    handleDragEnd();
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      handleDragStart(e.touches[0].clientX);
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      handleDragMove(e.touches[0].clientX);
    }
  };

  const onTouchEnd = () => {
    handleDragEnd();
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

    if (activeOtcTrade) {
      setErrorMsg("You already have an active pending trade. Please wait for it to expire.");
      return;
    }

    setIsSubmitting(true);
    try {
      const targetWonRoll = Math.random() < 0.5; // 50% chance of winning
      const res = await placeOtcTrade(parsedAmount, tradeSide, selectedDuration, currentPrice);
      if (res.success && res.txId) {
        setActiveOtcTrade({
          txId: res.txId,
          amount: parsedAmount,
          side: tradeSide,
          entryPrice: currentPrice,
          durationSeconds: selectedDuration,
          secondsLeft: selectedDuration,
          startTime: Date.now(),
          targetWon: targetWonRoll
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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-950 border-2 border-slate-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/10 via-emerald-500/50 to-amber-500/50" />
        
        {/* Left Side: Market Asset Profile (5 columns) */}
        <div className="md:col-span-5 flex items-center space-x-4 border-b md:border-b-0 md:border-r border-slate-900 pb-4 md:pb-0 md:pr-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Zap className="w-7 h-7 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xl font-black text-white tracking-tight">{assetName}</span>
              <span className="px-2.5 py-0.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 rounded-md font-mono text-[9px] font-black tracking-widest uppercase animate-pulse">
                LIVE
              </span>
            </div>
            <div className="mt-1.5 flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold font-mono">LIVE INDEX PRICE</span>
              <span className="text-2xl font-black font-mono text-emerald-400 tracking-tight transition-all">
                ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Center Panel: GIANT HIGH-VISIBILITY ROUND ID (3 columns) */}
        <div className="md:col-span-3 flex flex-col justify-center items-center bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[10px] text-amber-500 uppercase tracking-widest font-black flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            CURRENT ACTIVE ROUND
          </span>
          <div className="text-3xl font-extrabold font-mono text-white tracking-wider">
            #{currentRoundId}
          </div>
        </div>

        {/* Right Panel: GIANT HIGH-VISIBILITY COUNTDOWN TIMER (4 columns) */}
        <div className="md:col-span-4 flex flex-col justify-center items-center bg-slate-900/80 border-2 border-emerald-500/25 rounded-2xl p-4 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-1">
            <Clock className="w-3.5 h-3.5 text-emerald-500/20 animate-spin-slow" />
          </div>
          <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black flex items-center gap-1.5 mb-0.5">
            ⏳ TIME REMAINING
          </span>
          <div className={`text-4xl font-black font-mono tracking-widest ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
            00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
          </div>
          <p className="text-[8px] text-slate-500 font-mono mt-1 uppercase tracking-wider font-bold">
            {timeLeft <= 10 ? '🚨 LOCKOUT WARNING: CLOSING ROUND' : 'Contracts Auto-Settling at 00:00'}
          </p>
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

          {/* Candle Chart Zoom & Scroll Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/60 border border-slate-900 rounded-xl p-3">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider font-bold">
                  🔍 Candle Zoom: {zoomLevel} Bars shown
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1">
                👋 Swipe/Drag to Scroll
              </span>
            </div>
            <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-between sm:justify-end">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(6, prev - 2))}
                disabled={zoomLevel <= 6}
                className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 disabled:opacity-35 border border-slate-800 hover:border-slate-700 text-slate-200 font-extrabold flex items-center justify-center text-sm transition-all cursor-pointer select-none active:scale-95"
                title="Zoom In (Fewer candles, bigger size)"
              >
                ＋
              </button>
              
              <input
                type="range"
                min="6"
                max="40"
                step="2"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="flex-1 sm:w-28 accent-emerald-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer appearance-none"
              />

              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(40, prev + 2))}
                disabled={zoomLevel >= 40}
                className="w-8 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 disabled:opacity-35 border border-slate-800 hover:border-slate-700 text-slate-200 font-extrabold flex items-center justify-center text-sm transition-all cursor-pointer select-none active:scale-95"
                title="Zoom Out (More candles, smaller size)"
              >
                －
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setZoomLevel(16);
                  setScrollOffset(0);
                }}
                className="px-2.5 h-8 rounded-lg bg-slate-950 hover:bg-slate-800 hover:text-white border border-slate-800 text-[9px] font-mono font-bold text-slate-400 flex items-center justify-center uppercase transition-all cursor-pointer select-none active:scale-95"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Canvas-style Candlestick SVG element with interactive touch and mouse drag-to-scroll */}
          <div 
            className="w-full relative bg-slate-950/80 border border-slate-900 rounded-xl p-2 h-[280px] overflow-hidden select-none touch-none cursor-grab active:cursor-grabbing"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUpOrLeave}
            onMouseLeave={onMouseUpOrLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Grid line overlays for TradingView aesthetic */}
            <div className="absolute inset-0 grid grid-cols-5 grid-rows-4 pointer-events-none opacity-5">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="border-b border-r border-white" />
              ))}
            </div>

            {/* Historical data warning indicator & snap back to live button */}
            {scrollOffset > 0 && (
              <div className="absolute top-3 left-3 bg-slate-950/95 border border-amber-500/35 rounded-lg px-2.5 py-1.5 flex items-center gap-2 shadow-2xl z-10 animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Viewing History ({scrollOffset}m ago)
                </span>
                <button
                  type="button"
                  onClick={() => setScrollOffset(0)}
                  className="ml-1 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all cursor-pointer pointer-events-auto"
                >
                  🟢 Go Live
                </button>
              </div>
            )}

            {/* SVG Renderer */}
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible pointer-events-none">
              
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

              {activeOtcTrade && (
                <g>
                  {/* Entry price horizontal dashed line */}
                  <line 
                    x1={0} 
                    y1={scaleY(activeOtcTrade.entryPrice)} 
                    x2={actualChartWidth} 
                    y2={scaleY(activeOtcTrade.entryPrice)} 
                    stroke="#f59e0b" 
                    strokeDasharray="4,4" 
                    strokeWidth={1.5}
                    strokeOpacity={0.8} 
                  />
                  {/* Flashing entry price badge on the right scale */}
                  <rect
                    x={actualChartWidth + 3}
                    y={scaleY(activeOtcTrade.entryPrice) - 6}
                    width={50}
                    height={12}
                    fill="#f59e0b"
                    rx={2}
                  />
                  <text 
                    x={actualChartWidth + 6} 
                    y={scaleY(activeOtcTrade.entryPrice) + 3} 
                    fill="#0f172a" 
                    fontSize={8} 
                    fontWeight="black" 
                    fontFamily="monospace"
                  >
                    ${activeOtcTrade.entryPrice.toFixed(0)}
                  </text>
                  {/* Flashing entry point circle */}
                  <circle
                    cx={getX(displayedCandleData.length - 1)}
                    cy={scaleY(activeOtcTrade.entryPrice)}
                    r={5}
                    fill="#f59e0b"
                    className="animate-ping"
                  />
                </g>
              )}

              {/* Draw candlesticks */}
              {displayedCandleData.map((candle, idx) => {
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
          {activeOtcTrade && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 space-y-3.5 shadow-xl animate-pulse">
              <div className="flex items-center justify-between text-[10px] uppercase font-mono font-bold">
                <span className="text-amber-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />
                  LIVE CONTRACT TRADING ACTIVE
                </span>
                <span className="text-slate-400 font-bold">{activeOtcTrade.secondsLeft}s LEFT</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[8px] text-slate-500 block">SIDE</span>
                  <span className={`font-bold ${activeOtcTrade.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {activeOtcTrade.side === 'buy' ? '🟩 BUY' : '🟥 SELL'}
                  </span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">ENTRY PRICE</span>
                  <span className="font-bold text-white">${activeOtcTrade.entryPrice.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[8px] text-slate-500 block">LIVE PRICE</span>
                  <span className={`font-bold ${
                    activeOtcTrade.side === 'buy'
                      ? (currentPrice > activeOtcTrade.entryPrice ? 'text-emerald-400' : 'text-red-400')
                      : (currentPrice < activeOtcTrade.entryPrice ? 'text-emerald-400' : 'text-red-400')
                  }`}>
                    ${currentPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Progress Bar indicator */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                  <span>EXPIRATION COUNTER:</span>
                  <span className="text-white font-bold">{activeOtcTrade.secondsLeft}s / {activeOtcTrade.durationSeconds}s</span>
                </div>
                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    style={{ width: `${(activeOtcTrade.secondsLeft / activeOtcTrade.durationSeconds) * 100}%` }}
                    className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
                  />
                </div>
              </div>

              <div className="bg-slate-950/85 p-2 rounded border border-slate-800/60 text-center">
                <span className="text-[9px] text-slate-400 font-mono uppercase tracking-wider block">
                  CURRENT ESTIMATE:
                </span>
                <span className={`text-xs font-black font-mono tracking-widest ${
                  activeOtcTrade.side === 'buy'
                    ? (currentPrice > activeOtcTrade.entryPrice ? 'text-emerald-400' : 'text-red-400')
                    : (currentPrice < activeOtcTrade.entryPrice ? 'text-emerald-400' : 'text-red-400')
                }`}>
                  {activeOtcTrade.side === 'buy'
                    ? (currentPrice > activeOtcTrade.entryPrice ? '🟩 WINNING (IN THE MONEY)' : '🟥 LOSING (OUT OF THE MONEY)')
                    : (currentPrice < activeOtcTrade.entryPrice ? '🟩 WINNING (IN THE MONEY)' : '🟥 LOSING (OUT OF THE MONEY)')
                  }
                </span>
              </div>
            </div>
          )}

          {/* Order Side Toggle Selector */}
          {!activeOtcTrade && (
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

              {/* Expiration Selectors */}
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-mono font-bold tracking-widest mb-1.5">
                  2. SELECT CONTRACT EXPIRATION TIME
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {durationOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedDuration(opt.value)}
                      className={`py-2 rounded-xl font-bold font-mono text-[10px] uppercase tracking-wider transition-all border cursor-pointer ${
                        selectedDuration === opt.value
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/10'
                          : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-800'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Size Inputs */}
              <div>
                <label className="block text-[9px] text-slate-500 uppercase font-mono font-bold tracking-widest mb-1.5">
                  3. SPECIFY TRANSACTION AMOUNT (USDT)
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

            {/* Active Telemetry Sync Panel showing the matching minute and round */}
            <div className="bg-slate-950 px-3.5 py-2.5 border border-slate-800/85 rounded-xl text-center space-y-1">
              <div className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>ACTIVE TELEMETRY SYNC (EVERY 1 MIN)</span>
              </div>
              <div className="flex justify-center items-center space-x-3 text-xs">
                <div className="text-white font-bold font-mono">
                  ROUND ID: <span className="text-amber-500">#{currentRoundId}</span>
                </div>
                <div className="text-slate-700">|</div>
                <div className="text-white font-bold font-mono">
                  CANDLE TIME: <span className="text-emerald-400">{currentCandle?.time || 'Syncing'}</span>
                </div>
              </div>
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
                  💡 *This analysis is dynamically processed for your specific user block, updates every single minute to match the current candle, and aligns with active round #{currentRoundId}.
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
                {settlementResult.roundId > 0 ? `Round #${settlementResult.roundId}` : 'OTC Dynamic Contract'} Settle Completed
              </span>
              <h3 className="text-xl font-black text-white uppercase tracking-tight">
                {settlementResult.won ? '🎉 EXCEL_WINNER' : '❌ CONTRACT_EXPIRED'}
              </h3>
              <p className="text-xs text-slate-400 uppercase font-mono">
                Outcome: <span className={settlementResult.outcome === 'buy' ? 'text-emerald-400' : 'text-red-400'}>{settlementResult.outcome === 'buy' ? '🟩 BUY (GREEN)' : '🟥 SELL (RED)'}</span>
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
