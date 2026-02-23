
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Settings, 
  Users, 
  Trophy, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Trash2, 
  Download, 
  Sparkles,
  Gift,
  Volume2,
  UserX,
  RotateCcw,
  X
} from 'lucide-react';
import confetti from 'https://cdn.skypack.dev/canvas-confetti';
import { Prize, WinnerRecord, DrawMethod } from './types';
import { playSound, updateSoundUrls } from './utils/sounds';

const App: React.FC = () => {
  // --- 基礎設定 ---
  const [title, setTitle] = useState('年節大型抽獎盛典');
  const [subtitle, setSubtitle] = useState('財源滾滾、萬事如意、好禮抽不完');
  const [luckyPhrase, setLuckyPhrase] = useState('幸福加馬，大獎開花');
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const confettiInstance = useRef<any>(null);
  
  // --- 資源與音效 ---
  const [soundUrls, setSoundUrls] = useState({
    drawing: 'https://actions.google.com/sounds/v1/science_fiction/stinger.ogg', 
    winGrand: 'https://assets.mixkit.co/active_storage/sfx/2016/2016-preview.mp3', 
    winSmall: 'https://assets.mixkit.co/active_storage/sfx/2012/2012-preview.mp3',
    winNormal: 'https://assets.mixkit.co/active_storage/sfx/2060/2060-preview.mp3'
  });

  const [listModal, setListModal] = useState<{ isOpen: boolean; title: string; items: string[] }>({
    isOpen: false,
    title: '',
    items: []
  });

  useEffect(() => {
    if (canvasRef.current && !confettiInstance.current) {
      confettiInstance.current = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true,
      });
    }
  }, []);

  const [prizes, setPrizes] = useState<Prize[]>([
    { id: '1', name: '特等獎：奢華歐洲遊', totalCount: 1, remainingCount: 1 },
    { id: '2', name: '一等獎：iPhone 16 Pro Max', totalCount: 2, remainingCount: 2 },
    { id: '3', name: '二等獎：黃金元寶', totalCount: 5, remainingCount: 5 },
    { id: '4', name: '三等獎：開運紅包', totalCount: 10, remainingCount: 10 },
    { id: '5', name: '普天同慶獎：福袋', totalCount: 20, remainingCount: 20 },
  ]);
  
  const [participantsRaw, setParticipantsRaw] = useState('張三|https://i.pravatar.cc/150?u=1\n李四|https://i.pravatar.cc/150?u=2\n王五|https://i.pravatar.cc/150?u=3\n趙六|https://i.pravatar.cc/150?u=4\n錢七|https://i.pravatar.cc/150?u=5\n孫八|https://i.pravatar.cc/150?u=6');
  const [winners, setWinners] = useState<WinnerRecord[]>([]);
  const [activeTab, setActiveTab] = useState<DrawMethod>(DrawMethod.SELECT_PRIZE_DRAW_PERSON);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [rollingName, setRollingName] = useState('');
  const [mode2Step, setMode2Step] = useState<'idle' | 'person_selected'>('idle');
  const [mode3Step, setMode3Step] = useState<'idle' | 'person_selected'>('idle');
  const [tempWinnerName, setTempWinnerName] = useState<string | null>(null);

  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [currentWinner, setCurrentWinner] = useState<{ name: string; prize: string; avatar?: string; isGrand: boolean } | null>(null);

  useEffect(() => {
    updateSoundUrls(soundUrls);
  }, [soundUrls]);

  const participants = useMemo(() => {
    return participantsRaw.split('\n').filter(line => line.trim() !== '').map((line, idx) => {
      const parts = line.split('|');
      const name = parts[0].trim();
      const avatar = parts[1] && parts[1].trim() !== '' ? parts[1].trim() : undefined;
      return {
        id: `${name}-${idx}`,
        name: name,
        avatar: avatar,
        hasWon: winners.some(w => w.participantName === name)
      };
    });
  }, [participantsRaw, winners]);

  const availableParticipants = useMemo(() => participants.filter(p => !p.hasWon), [participants]);
  const totalRemainingPrizes = useMemo(() => prizes.reduce((acc, p) => acc + p.remainingCount, 0), [prizes]);

  const resetRecords = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('確定要「徹底清除」所有中獎記錄嗎？\n此動作將清空榜單並還原所有庫存。')) {
      setWinners([]); 
      setPrizes(prev => prev.map(p => ({ ...p, remainingCount: p.totalCount })));
      setMode2Step('idle');
      setMode3Step('idle');
      setTempWinnerName(null);
      setRollingName('');
      setShowWinnerModal(false);
      setCurrentWinner(null);
      setIsDrawing(false);
      confettiInstance.current?.reset();
    }
  }, [prizes]);

  const triggerCelebration = (prizeIndex: number) => {
    if (!confettiInstance.current) return;
    confettiInstance.current.reset();

    const isGrand = prizeIndex < 2;
    if (isGrand) {
      playSound('winGrand');
      const duration = 7 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 45, spread: 360, ticks: 120, colors: ['#ff0000', '#ffd700', '#ffffff', '#ff4500', '#E9BF16'] };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 150 * (timeLeft / duration);
        confettiInstance.current({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.4), y: randomInRange(0.2, 0.5) } });
        confettiInstance.current({ ...defaults, particleCount, origin: { x: randomInRange(0.6, 0.9), y: randomInRange(0.2, 0.5) } });
        // 中心噴泉
        confettiInstance.current({ ...defaults, particleCount: particleCount / 2, origin: { x: 0.5, y: 0.4 }, gravity: 1.2 });
      }, 200);
    } else {
      playSound('winNormal');
      // 更加繁華的普通獎特效
      confettiInstance.current({
        particleCount: 250,
        spread: 180,
        origin: { y: 0.35 }, 
        colors: ['#ff0000', '#ffd700', '#ffffff', '#ff4500', '#E9BF16', '#ff00ff'],
        gravity: 0.8,
        startVelocity: 70,
        scalar: 1.2
      });
      // 補一下旁邊的小火花
      setTimeout(() => {
        confettiInstance.current({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
        confettiInstance.current({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
      }, 150);
    }
  };

  const getWinnerDisplayAvatar = (winnerName: string, prizeId: string) => {
    const winnerData = participants.find(p => p.name === winnerName);
    if (winnerData?.avatar) return winnerData.avatar;
    
    // 實作使用者要求的預設頭像邏輯
    const prizeIndex = prizes.findIndex(p => p.id === prizeId);
    if (prizeIndex === 0 || prizeIndex === 1) {
      return 'https://i.pravatar.cc/150?u=25'; // 前兩個獎項
    } else if (prizeIndex === 2 || prizeIndex === 3) {
      return 'https://i.pravatar.cc/150?u=11'; // 第3和第4個
    } else if (prizeIndex === prizes.length - 1 && prizes.length > 0) {
      return 'https://i.pravatar.cc/150?u=15'; // 最後一個
    }
    return 'https://i.pravatar.cc/150?u=45'; // 其他
  };

  const finalizeWinner = (winnerName: string, prize: Prize, methodText: string) => {
    const prizeIndex = prizes.findIndex(p => p.id === prize.id);
    const isGrand = prizeIndex < 2;
    const displayAvatar = getWinnerDisplayAvatar(winnerName, prize.id);

    const newRecord: WinnerRecord = {
      id: Date.now().toString(),
      participantName: winnerName,
      prizeName: prize.name,
      method: methodText,
      timestamp: new Date().toLocaleString('zh-TW', { hour12: false })
    };

    setWinners(prev => [newRecord, ...prev]);
    setPrizes(prev => prev.map(p => p.id === prize.id ? { ...p, remainingCount: p.remainingCount - 1 } : p));
    setCurrentWinner({ name: winnerName, prize: prize.name, avatar: displayAvatar, isGrand });
    setShowWinnerModal(true);
    setTimeout(() => triggerCelebration(prizeIndex), 100);
  };

  const startRolling = (onFinish: (winner: string) => void) => {
    if (availableParticipants.length === 0) return alert('⚠️ 所有參與者都已中獎！');
    if (totalRemainingPrizes === 0) return alert('⚠️ 獎項已全部抽出！');

    setIsDrawing(true);
    playSound('drawing');
    let iterations = 0;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * availableParticipants.length);
      setRollingName(availableParticipants[idx].name);
      iterations++;
      if (iterations > 25) {
        clearInterval(interval);
        setIsDrawing(false);
        const final = availableParticipants[Math.floor(Math.random() * availableParticipants.length)].name;
        onFinish(final);
      }
    }, 60);
  };

  const runMode1 = (pId: string) => {
    const prize = prizes.find(p => p.id === pId);
    if (!prize || prize.remainingCount <= 0) return alert('此獎項已抽完');
    startRolling(winner => finalizeWinner(winner, prize, '方式1：選獎抽人'));
  };

  const runMode2_Step1 = () => startRolling(winner => {
    setTempWinnerName(winner);
    setMode2Step('person_selected');
  });

  const runMode2_Step2 = (pId: string) => {
    if (!tempWinnerName) return;
    const prize = prizes.find(p => p.id === pId);
    if (!prize || prize.remainingCount <= 0) return alert('此獎項已抽完');
    finalizeWinner(tempWinnerName, prize, '方式2：只抽人');
    setMode2Step('idle');
    setTempWinnerName(null);
  };

  const runMode3_Step1 = () => startRolling(winner => {
    setTempWinnerName(winner);
    setMode3Step('person_selected');
  });

  const runMode3_Step2 = () => {
    if (!tempWinnerName) return;
    const availablePrizesList = prizes.filter(p => p.remainingCount > 0);
    if (availablePrizesList.length === 0) return alert('無可用獎項');

    setIsDrawing(true);
    playSound('drawing');
    let iterations = 0;
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * availablePrizesList.length);
      setRollingName(`🎁 ${availablePrizesList[idx].name}`); 
      iterations++;
      if (iterations > 30) {
        clearInterval(interval);
        setIsDrawing(false);
        const finalPrize = availablePrizesList[Math.floor(Math.random() * availablePrizesList.length)];
        finalizeWinner(tempWinnerName, finalPrize, '方式3：人後抽獎');
        setMode3Step('idle');
        setTempWinnerName(null);
      }
    }, 60);
  };

  const exportCSV = () => {
    if (winners.length === 0) return alert('目前沒有記錄可匯出');
    const headers = ['姓名', '獎項', '抽獎方式', '時間'];
    const rows = winners.map(w => [w.participantName, w.prizeName, w.method, w.timestamp]);
    const content = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `抽獎結果_${new Date().getTime()}.csv`;
    link.click();
  };

  const handlePrizeChange = (id: string, field: keyof Prize, val: any) => {
    setPrizes(prev => prev.map(p => p.id === id ? { ...p, [field]: val, remainingCount: field === 'totalCount' ? val : p.remainingCount } : p));
  };

  const handleSoundChange = (key: keyof typeof soundUrls, val: string) => {
    setSoundUrls(prev => ({ ...prev, [key]: val }));
  };

  const viewFullParticipants = () => setListModal({ isOpen: true, title: '總參與人員名單', items: participants.map(p => p.name) });
  const viewAvailableParticipants = () => setListModal({ isOpen: true, title: '未中獎人員名單', items: availableParticipants.map(p => p.name) });
  const viewRemainingPrizes = () => setListModal({ isOpen: true, title: '剩餘獎項明細', items: prizes.filter(p => p.remainingCount > 0).map(p => `${p.name} (剩餘 ${p.remainingCount} 份)`) });

  return (
    <div className="min-h-screen pb-20 relative overflow-x-hidden">
      {/* 提升彩帶 Z-Index 到最高級別，確保位於所有 Modal 與動畫之上 */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-[500000]" />

      <header className="festive-header pt-10 pb-14 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)] tracking-widest leading-none">{title}</h1>
        <p className="gold-text mt-5 text-xl md:text-2xl font-bold tracking-widest animate-pulse drop-shadow-md">{luckyPhrase}</p>
      </header>

      <main className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard icon={<Users className="w-10 h-10 text-blue-600" />} label="總參與人數" value={participants.length} color="border-blue-500" onClick={viewFullParticipants} />
          <StatCard icon={<UserX className="w-10 h-10 text-rose-600" />} label="未中獎人數" value={availableParticipants.length} color="border-rose-500" warning={availableParticipants.length === 0} onClick={viewAvailableParticipants} />
          <StatCard icon={<Gift className="w-10 h-10 text-orange-600" />} label="剩餘獎項總數" value={totalRemainingPrizes} color="border-orange-500" warning={totalRemainingPrizes === 0} onClick={viewRemainingPrizes} />
        </div>

        <div className="bg-white/95 rounded-[40px] shadow-2xl mb-10 overflow-hidden gold-border-heavy">
          <button onClick={() => setIsSetupOpen(!isSetupOpen)} className="w-full px-10 py-5 flex items-center justify-between hover:bg-yellow-50 transition-all text-gray-900 group">
            <div className="flex items-center gap-5 font-black text-2xl">
              <Settings className="w-8 h-8 gold-text group-hover:rotate-90 transition-transform duration-500" /> 獎項及人員管理系統
            </div>
            {isSetupOpen ? <ChevronUp className="w-8 h-8" /> : <ChevronDown className="w-8 h-8" />}
          </button>
          {isSetupOpen && (
            <div className="p-8 border-t-4 border-dashed border-yellow-200 bg-stone-50 text-stone-900 overflow-visible">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* 左側：基本資訊與人員 */}
                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-black text-stone-600 mb-4 uppercase tracking-widest flex items-center gap-2"><Trophy className="w-4 h-4" /> 標題與標語設定</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-stone-400 mb-1 block">主標題</label>
                        <input className="w-full px-5 py-3 border-2 border-stone-200 rounded-2xl text-stone-900 font-black bg-white focus:border-red-600 outline-none shadow-sm" value={title} onChange={e => setTitle(e.target.value)} placeholder="主標題" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-400 mb-1 block">副標題 (頁面副標)</label>
                        <input className="w-full px-5 py-3 border-2 border-stone-200 rounded-2xl text-stone-900 font-black bg-white focus:border-red-600 outline-none shadow-sm" value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="副標題" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-400 mb-1 block">抽獎區標語 (如：幸福加馬...)</label>
                        <input className="w-full px-5 py-3 border-2 border-stone-200 rounded-2xl text-stone-900 font-black bg-white focus:border-red-600 outline-none shadow-sm" value={luckyPhrase} onChange={e => setLuckyPhrase(e.target.value)} placeholder="標語" />
                      </div>
                    </div>
                  </section>
                  <section>
                    <h3 className="text-sm font-black text-stone-600 mb-4 uppercase tracking-widest flex items-center gap-2"><Users className="w-4 h-4" /> 人員匯入 (姓名|頭像URL)</h3>
                    <textarea className="w-full h-40 px-5 py-3 border-2 border-stone-200 rounded-2xl text-stone-900 font-bold text-sm font-mono bg-white outline-none focus:border-red-600 shadow-sm" value={participantsRaw} onChange={e => setParticipantsRaw(e.target.value)} />
                  </section>
                </div>

                {/* 右側：音效網址與獎項列表 */}
                <div className="space-y-8">
                  <section>
                    <h3 className="text-sm font-black text-stone-600 mb-4 uppercase tracking-widest flex items-center gap-2"><Volume2 className="w-4 h-4" /> 音效網址管理</h3>
                    <div className="bg-white p-6 rounded-2xl border-2 border-stone-100 shadow-sm space-y-4">
                      {Object.keys(soundUrls).map((key) => (
                        <div key={key} className="flex items-center gap-4">
                          <label className="w-24 text-xs font-black text-stone-500 uppercase">{key}:</label>
                          <input 
                            className="flex-grow px-4 py-2 border border-stone-200 rounded-xl text-xs font-mono bg-stone-50 focus:bg-white outline-none focus:border-red-600"
                            value={soundUrls[key as keyof typeof soundUrls]} 
                            onChange={e => handleSoundChange(key as keyof typeof soundUrls, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                  
                  <section>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-black text-stone-600 uppercase tracking-widest flex items-center gap-2"><Gift className="w-4 h-4" /> 獎項列表設定</h3>
                      <button onClick={() => setPrizes([...prizes, { id: Date.now().toString(), name: '新獎項', totalCount: 1, remainingCount: 1 }])} className="p-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 transition-colors shadow-md"><Plus className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar overflow-x-visible">
                      {prizes.map((p, idx) => (
                        <div key={p.id} className={`p-4 bg-white border-2 rounded-2xl flex items-center gap-4 shadow-sm relative group overflow-visible ${idx < 2 ? 'border-red-100 bg-red-50/20' : 'border-stone-100'}`}>
                          <div className="flex flex-col flex-grow">
                             <div className="flex items-center gap-2 mb-1">
                                {idx < 2 ? <span className="text-[10px] font-black text-orange-600 flex items-center gap-1"><Sparkles className="w-3 h-3" /> 超級大獎</span> : <span className="text-[10px] font-bold text-stone-400 flex items-center gap-1"><Trophy className="w-3 h-3" /> 一般獎項</span>}
                             </div>
                             <input className="w-full font-black text-stone-900 text-base bg-transparent outline-none" value={p.name} onChange={e => handlePrizeChange(p.id, 'name', e.target.value)} />
                          </div>
                          <div className="flex items-center gap-3">
                             <span className="text-[10px] font-bold text-stone-400">數量:</span>
                             {/* Fix handlePrizeChange usage in onChange handler */}
                             <input type="number" className="w-16 border-2 border-stone-200 rounded-xl text-center font-black text-stone-900 text-sm py-1.5 bg-stone-50 outline-none focus:border-red-600" value={p.totalCount} onChange={(e) => handlePrizeChange(p.id, 'totalCount', parseInt(e.target.value)||1)} />
                             <button onClick={() => setPrizes(prizes.filter(pr => pr.id !== p.id))} className="text-stone-300 hover:text-rose-600 transition-colors"><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/95 rounded-[50px] shadow-3xl overflow-hidden mb-10 gold-border-heavy min-h-[480px] flex flex-col">
          <div className="flex bg-stone-100 border-b-2">
            <TabBtn active={activeTab === DrawMethod.SELECT_PRIZE_DRAW_PERSON} onClick={() => {setActiveTab(DrawMethod.SELECT_PRIZE_DRAW_PERSON); setTempWinnerName(null);}} label="方式1：指定獎項抽選" />
            <TabBtn active={activeTab === DrawMethod.DRAW_PERSON_ONLY} onClick={() => {setActiveTab(DrawMethod.DRAW_PERSON_ONLY); setTempWinnerName(null);}} label="方式2：抽選後指定獎項" />
            <TabBtn active={activeTab === DrawMethod.DRAW_PERSON_THEN_PRIZE} onClick={() => {setActiveTab(DrawMethod.DRAW_PERSON_THEN_PRIZE); setTempWinnerName(null);}} label="方式3：人與獎項盲抽" />
          </div>
          <div className="flex-grow p-10 flex flex-col items-center justify-center text-center">
             <div className="mb-10 min-h-[140px] flex items-center justify-center">
                <div className={`text-6xl md:text-9xl font-black tracking-tighter leading-tight ${
                  isDrawing ? 'scale-105 text-red-600 drawing-rolling' : (tempWinnerName ? 'text-stone-900' : 'gold-text animate-pulse drop-shadow-md')
                }`}>
                   {isDrawing ? rollingName : (tempWinnerName || luckyPhrase)}
                </div>
             </div>
             <div className="w-full max-w-xl">
                {activeTab === DrawMethod.SELECT_PRIZE_DRAW_PERSON && (
                  <div className="flex flex-col gap-5">
                    <select id="selPrize1" className="w-full p-5 bg-white border-4 border-yellow-600 rounded-3xl font-black text-2xl text-stone-900 outline-none shadow-xl text-center cursor-pointer">
                       {prizes.map(p => <option key={p.id} value={p.id}>{p.name} (剩餘: {p.remainingCount})</option>)}
                    </select>
                    <button onClick={() => runMode1((document.getElementById('selPrize1') as HTMLSelectElement).value)} disabled={isDrawing || prizes.length === 0} className="w-full py-7 btn-casino text-white rounded-[40px] font-black text-4xl shadow-2xl flex items-center justify-center gap-6 animate-pulse-gold active:scale-95 disabled:opacity-50 transition-all">
                      <Sparkles className="w-10 h-10" /> 開始抽獎
                    </button>
                  </div>
                )}
                {activeTab === DrawMethod.DRAW_PERSON_ONLY && (
                  <div className="space-y-8">
                    {mode2Step === 'idle' ? (
                      <button onClick={runMode2_Step1} disabled={isDrawing} className="w-full py-8 btn-casino text-white rounded-[40px] font-black text-4xl shadow-2xl flex items-center justify-center gap-6 animate-pulse-gold active:scale-95 transition-all">
                        <Users className="w-10 h-10" /> 抽選幸運兒
                      </button>
                    ) : (
                      <div className="p-8 bg-yellow-50 border-4 border-yellow-600 rounded-[40px] shadow-3xl space-y-6">
                        <div className="font-black text-stone-800 text-2xl italic">請為 <span className="text-5xl text-red-700 underline px-3">{tempWinnerName}</span> 指定獎項：</div>
                        <select id="selPrize2" className="w-full p-5 bg-white border-2 border-stone-300 rounded-2xl font-black text-2xl text-stone-900 text-center cursor-pointer">
                           {prizes.filter(p => p.remainingCount > 0).map(p => <option key={p.id} value={p.id}>{p.name} (剩餘: {p.remainingCount})</option>)}
                        </select>
                        <button onClick={() => runMode2_Step2((document.getElementById('selPrize2') as HTMLSelectElement).value)} className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-[30px] font-black text-3xl shadow-xl active:translate-y-2 transition-all">確認中獎！</button>
                      </div>
                    )}
                  </div>
                )}
                {activeTab === DrawMethod.DRAW_PERSON_THEN_PRIZE && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <button onClick={runMode3_Step1} disabled={isDrawing || mode3Step !== 'idle'} className={`py-8 rounded-[40px] font-black text-3xl shadow-2xl transition-all active:scale-95 ${mode3Step === 'idle' ? 'btn-casino text-white animate-pulse-gold' : 'bg-stone-200 text-stone-400 grayscale'}`}>1. 抽幸運兒</button>
                     <button onClick={runMode3_Step2} disabled={isDrawing || mode3Step !== 'person_selected'} className={`py-8 rounded-[40px] font-black text-3xl shadow-2xl transition-all active:scale-95 ${mode3Step === 'person_selected' ? 'bg-purple-600 hover:bg-purple-700 text-white animate-pulse-gold border-b-8 border-purple-900' : 'bg-stone-200 text-stone-400 grayscale'}`}>2. 抽大獎！</button>
                  </div>
                )}
             </div>
          </div>
        </div>

        <div className="bg-white/95 rounded-[40px] shadow-3xl p-10 gold-border-heavy relative z-20">
          <div className="flex items-center justify-between mb-10 flex-wrap gap-6 border-b-2 border-stone-100 pb-8">
             <h3 className="text-4xl font-black text-stone-900 flex items-center gap-4">
               <div className="w-3 h-12 bg-red-700 rounded-full"></div> 中獎英雄榜
             </h3>
             <div className="flex gap-4">
               <button onClick={exportCSV} className="flex items-center gap-3 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-lg active:scale-95 shadow-xl transition-colors"><Download className="w-6 h-6" /> 匯出結果</button>
               <button onClick={resetRecords} className="flex items-center gap-3 px-8 py-3.5 bg-red-700 hover:bg-red-800 text-white rounded-2xl font-black text-lg active:scale-95 shadow-xl border-b-4 border-red-950 transition-colors"><RotateCcw className="w-6 h-6" /> 徹底重置</button>
             </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
             {winners.map(w => (
                 <div key={w.id} className="p-6 bg-stone-50 rounded-3xl border-2 border-white shadow-xl flex flex-col items-center hover:scale-105 transition-all group">
                    <img src={getWinnerDisplayAvatar(w.participantName, prizes.find(p=>p.name===w.prizeName)?.id || '')} className="w-20 h-20 rounded-full mb-4 border-4 border-white shadow-lg object-cover" />
                    <div className="text-xl font-black text-stone-900 truncate w-full text-center mb-2">{w.participantName}</div>
                    <span className="px-4 py-1.5 bg-red-700 text-white text-xs font-black rounded-full">{w.prizeName}</span>
                 </div>
             ))}
             {winners.length === 0 && <div className="col-span-full py-24 text-center text-stone-300 font-black text-4xl opacity-50 italic">萬眾矚目 · 等待開獎</div>}
          </div>
        </div>
      </main>

      {/* Winner Modal - 終極視覺修復版：無滑桿、垂直置中、彈性調整 */}
      {showWinnerModal && currentWinner && (
        <div className="fixed inset-0 z-[300000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300 overflow-hidden">
          
          {/* 主容器：限制 max-height 為 85vh 並確保垂直置中 */}
          <div className="relative max-w-[700px] w-full max-h-[85vh] flex flex-col overflow-visible items-center justify-center">
            
            {/* 卡片本體：overflow-hidden 消除滑桿，使用 flex 分佈內容 */}
            <div className={`modal-gold rounded-[60px] relative w-full h-full shadow-[0_0_150px_rgba(212,175,55,0.7)] animate-in zoom-in-50 duration-300 border-[8px] border-yellow-500 flex flex-col overflow-hidden bg-[#fff9c4]`}>
               
               {/* 頂部裝飾條：sticky 確保它始終在頂部 */}
               <div className="sticky top-0 left-0 w-full h-4 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 rounded-t-[52px] z-[40]"></div>
               
               <button onClick={() => setShowWinnerModal(false)} className="absolute top-6 right-8 p-2 text-stone-400 hover:text-red-700 transition-all z-50">
                  <X className="w-10 h-10" />
               </button>

               {/* 內容區塊：使用 pt-[10vh] 確保頂部動畫有空間，gap 使用 vh 單位實現彈性縮放 */}
               <div className="flex-grow flex flex-col items-center relative z-10 pt-[10vh] pb-8 px-8 overflow-hidden">
                  
                  {/* 星星圖標：絕對定位於 pt 空間，確保跳動不被截斷 */}
                  <div className="absolute top-[2vh] flex flex-col items-center">
                    <div className={`w-16 h-16 md:w-20 md:h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-2xl border-4 border-white animate-bounce relative z-[60] ${currentWinner.isGrand ? 'scale-110 md:scale-120' : ''}`}>
                      <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-white" />
                    </div>
                  </div>

                  {/* 標題與裝飾：間距使用彈性 gap */}
                  <div className="mb-[2vh] flex flex-col items-center shrink-0">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-red-700 tracking-[0.3em] leading-tight drop-shadow-sm uppercase">
                      {currentWinner.isGrand ? '🌟 狂賀大喜 🌟' : '🧧 恭喜中獎 🧧'}
                    </h2>
                  </div>
                  
                  {/* 中獎人區域：頭像高度增至 20% (約 17-20vh) */}
                  <div className="flex flex-col md:flex-row items-center justify-center gap-y-3 md:gap-x-10 mb-[3vh] w-full shrink-0">
                    <div className="relative shrink-0 flex items-center justify-center h-[20vh]">
                       <img src={currentWinner.avatar} className={`h-full aspect-square rounded-full border-8 border-white shadow-2xl object-cover relative z-10 transition-transform ${currentWinner.isGrand ? 'scale-105 md:scale-110' : ''}`} />
                       <div className="absolute -inset-10 bg-yellow-400 rounded-full opacity-30 blur-3xl animate-pulse"></div>
                    </div>
                    <div className="text-5xl md:text-7xl lg:text-9xl font-black text-stone-900 leading-none tracking-tighter drop-shadow-md whitespace-nowrap overflow-visible">
                      {currentWinner.name}
                    </div>
                  </div>
                  
                  {/* 獎項與按鈕：福氣領取按鈕扁平化，寬度 80% */}
                  <div className="w-full flex flex-col items-center gap-y-[2vh] shrink-0">
                    <div className={`text-xl md:text-2xl lg:text-4xl font-black text-orange-600 bg-white/95 px-8 py-3 md:px-14 md:py-4 rounded-[25px] md:rounded-[35px] border-4 border-orange-100 shadow-xl inline-block leading-tight ${currentWinner.isGrand ? 'bg-yellow-50 border-yellow-400 text-red-700' : ''} max-w-full truncate drop-shadow-sm`}>
                      {currentWinner.prize}
                    </div>
                    
                    <button onClick={() => setShowWinnerModal(false)} className="w-[80%] py-2 md:py-3 bg-red-700 hover:bg-red-800 text-white rounded-[35px] md:rounded-[45px] font-black text-xl md:text-3xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-b-[6px] md:border-b-[10px] border-red-950 active:border-b-0 active:translate-y-1 transition-all active:scale-95 tracking-widest uppercase">
                      福氣領取！
                    </button>
                  </div>
                  
                  <p className={`mt-[2vh] text-xs md:text-base lg:text-lg font-black animate-pulse tracking-[0.4em] shrink-0 ${currentWinner.isGrand ? 'text-yellow-600' : 'text-blue-600'}`}>
                     {currentWinner.isGrand ? '🧨 鞭炮齊鳴 · 富貴臨門 🧨' : '🎈 歡慶時刻 · 好運連連 🎈'}
                  </p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* 清單顯示 Modal */}
      {listModal.isOpen && (
        <div className="fixed inset-0 z-[110000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[40px] shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden border-4 border-red-700">
            <div className="p-8 bg-red-700 text-white flex items-center justify-between">
              <h3 className="text-3xl font-black tracking-widest">{listModal.title}</h3>
              <button onClick={() => setListModal({ ...listModal, isOpen: false })}><X className="w-8 h-8" /></button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar flex-grow bg-stone-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listModal.items.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white rounded-2xl border-2 border-stone-100 font-bold text-stone-800 flex items-center gap-4 shadow-sm">
                    <span className="w-8 h-8 flex items-center justify-center bg-yellow-400 text-red-800 rounded-full text-xs font-black">{idx + 1}</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 bg-stone-100 border-t flex justify-center">
               <button onClick={() => setListModal({ ...listModal, isOpen: false })} className="px-12 py-3 bg-stone-800 text-white rounded-full font-black">關閉視窗</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gold-border-heavy { border: 6px solid #d4af37; box-shadow: 0 0 40px rgba(0,0,0,0.3); }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4af37; border-radius: 10px; }
        /* 隱藏滾動條但保持功能 */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: number, color: string, warning?: boolean, onClick?: () => void }> = ({ icon, label, value, color, warning, onClick }) => (
  <div onClick={onClick} className={`stat-card p-6 md:p-8 rounded-[40px] flex flex-col items-center text-center shadow-2xl border-2 cursor-pointer ${color} ${warning ? 'bg-rose-50 border-red-300' : 'bg-white border-white'}`}>
    <div className="p-4 bg-stone-50 rounded-full mb-4 shadow-inner border border-stone-100">{icon}</div>
    <div className={`text-5xl md:text-6xl font-black mb-1 leading-none ${warning ? 'text-red-700' : 'text-stone-900'}`}>{value}</div>
    <div className="text-xs font-black text-stone-500 uppercase tracking-widest mt-2">{label}</div>
  </div>
);

const TabBtn: React.FC<{ active: boolean, onClick: () => void, label: string }> = ({ active, onClick, label }) => (
  <button onClick={onClick} className={`flex-1 py-5 text-sm md:text-lg font-black transition-all border-b-4 ${active ? 'border-red-700 text-red-800 bg-white shadow-inner' : 'border-transparent text-stone-400 hover:text-stone-700 hover:bg-stone-50'}`}>
    {label}
  </button>
);

export default App;
