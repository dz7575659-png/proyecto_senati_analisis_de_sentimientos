import React, { useState, useEffect, useRef, Component } from 'react';
import { 
  BrainCircuit, MessageSquare, Send, Smile, Frown, Meh, 
  Sparkles, Info, ShieldCheck, Zap, History, BarChart3, 
  Mic, MicOff, Download, Trash2, PieChart as PieChartIcon,
  Activity, Layers, Database, Cpu, FileUp, Files, Scale,
  LayoutDashboard, Settings, Share2, FileJson, TrendingUp,
  AlertTriangle, Target, Fingerprint, Eye, Search, Maximize2,
  RefreshCw, Bot, ChevronRight, Lightbulb, ScanFace, X, User,
  MessageCircle, Wand2, Network
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Radar, RadarChart, 
  PolarGrid, PolarAngleAxis, AreaChart, Area
} from 'recharts';

// --- SISTEMA DE PROTECCIÓN DE NÚCLEO (Blindado) ---
class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020203] text-indigo-500 flex flex-col items-center justify-center p-10 font-sans">
          <AlertTriangle className="w-16 h-16 mb-6 text-red-500" />
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Error de Inferencia Neural</h2>
          <p className="text-slate-500 text-sm mb-8">Conflicto de renderizado detectado. Se requiere purga total.</p>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl">
            Reiniciar Núcleo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface AnalysisResult {
  id: string;
  text: string;
  label: string;
  emoji: string;
  color: string;
  score: number;
  date: string;
  emotions: { name: string; value: number }[];
  tone: string;
  sarcasmProbability: number;
  intent: string;
  recommendation: string;
}

function App() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState<'lab' | 'dashboard' | 'history' | 'ai'>('lab');
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [scanStep, setScanStep] = useState('');
  const [personality, setPersonality] = useState<'diplomatic' | 'commercial' | 'empathy'>('diplomatic');
  const [aiChat, setAiChat] = useState<{role: 'ia' | 'user', text: string}[]>([
    { role: 'ia', text: 'Sistemas neuronales activos. Soy Cortex. ¿En qué modo de respuesta deseas que trabaje hoy?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ai_ultra_final_v11');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) { setHistory([]); }
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_ultra_final_v11', JSON.stringify(history));
  }, [history]);

  const simulateAI = (t: string) => {
    const l = t.toLowerCase();
    
    // Diccionarios Emocionales
    const emoMap = {
      feliz: ['feliz', 'alegre', 'bien', 'excelente', 'bueno', 'increíble', 'amo', 'genial', 'perfecto', 'éxito', 'felicidades', 'gracias', 'brillante', 'top', 'crack'],
      molesto: ['ira', 'odio', 'asco', 'malo', 'peor', 'horrible', 'enojo', 'molesto', 'enfado', 'basura', 'mierda', 'puto', 'estafa', 'fraude', 'robo'],
      triste: ['triste', 'pena', 'dolor', 'decepción', 'lamentable', 'lloro', 'pobre', 'mal', 'vacio', 'soledad', 'perder', 'perdida'],
      incomodo: ['asco', 'incómodo', 'raro', 'extraño', 'desagradable', 'sucio', 'feo', 'lento', 'falla', 'error', 'mediocre'],
    };

    let scores = { feliz: 0, molesto: 0, triste: 0, incomodo: 0 };
    Object.entries(emoMap).forEach(([emo, keywords]) => {
      scores[emo as keyof typeof scores] = keywords.filter(k => l.includes(k)).length;
    });

    const intensifiers = ['muy', 'demasiado', 'super', 'totalmente', 'realmente'];
    const mult = intensifiers.some(i => l.includes(i)) ? 1.5 : 1;

    // Determinar emoción dominante
    const topEmotion = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
    
    const isSarcastic = (l.includes('capacidad para') || l.includes('expertos en') || l.includes('vaya ') || (l.includes('felicidades') && scores.molesto > 0)) && scores.feliz > 0;

    if (isSarcastic) return { label: "Sarcástico", emoji: "🙄", score: 0.99, color: "text-indigo-400" };
    if (topEmotion[1] === 0) return { label: "Neutral", emoji: "😐", score: 0.5, color: "text-slate-400" };
    
    const results = {
      feliz: { label: "Feliz", emoji: "😊", color: "text-green-400" },
      molesto: { label: "Molesto", emoji: "😡", color: "text-red-400" },
      triste: { label: "Triste", emoji: "😢", color: "text-blue-400" },
      incomodo: { label: "Incómodo", emoji: "🤢", color: "text-yellow-600" }
    };

    const res = results[topEmotion[0] as keyof typeof results];
    return { ...res, score: Math.min(0.99, 0.6 + (topEmotion[1] * 0.1 * mult)) };
  };

  const getRecommendation = (res: any) => {
    const l = text.toLowerCase();
    if (res.label === 'Sarcástico') return "⚠️ SARCASMO: Crítica oculta. Acción: Responder con empatía extrema y escalar a soporte.";
    if (res.label === 'Molesto') return "🛑 ALERTA: Cliente airado. Acción: Ofrecer compensación o solución inmediata.";
    if (res.label === 'Triste') return "💔 EMPATÍA: Cliente decepcionado. Acción: Pedir disculpas y ofrecer ayuda personalizada.";
    if (res.label === 'Feliz') return "✅ ÉXITO: Cliente satisfecho. Acción: Solicitar testimonio o invitar a referidos.";
    return "🔎 NEUTRAL: Monitoreo estándar.";
  };

  const startScan = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setCurrentResult(null);
    const steps = ['Tokenizando...', 'Inferencia BERT...', 'Capa Emocional...', 'Finalizando...'];
    for (const step of steps) { setScanStep(step); await new Promise(r => setTimeout(r, 500)); }
    const topRes = simulateAI(text);
    const result: AnalysisResult = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      label: topRes.label,
      emoji: topRes.emoji,
      color: topRes.color,
      score: topRes.score,
      date: new Date().toLocaleTimeString(),
      emotions: [
        {name: 'Alegría', value: topRes.label === 'Feliz' ? 90 : 10},
        {name: 'Ira', value: topRes.label === 'Molesto' ? 90 : 10},
        {name: 'Tristeza', value: topRes.label === 'Triste' ? 90 : 10},
        {name: 'Disgusto', value: topRes.label === 'Incómodo' ? 90 : 10},
      ],
      tone: 'Neural Process',
      sarcasmProbability: topRes.label === 'Sarcástico' ? 95 : 5,
      intent: 'Sentiment Analysis',
      recommendation: ''
    };
    result.recommendation = getRecommendation(result);
    setCurrentResult(result);
    setHistory(prev => [result, ...prev].slice(0, 50));
    setLoading(false);
  };

  const handleAiChat = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    const l = msg.toLowerCase();
    setChatInput('');
    setAiChat(prev => [...prev, { role: 'user', text: msg }]);
    
    setTimeout(() => {
      let r = "";
      if (l.includes('hola') || l.includes('buen')) {
        r = `¡Hola! Soy Cortex en modo ${personality === 'diplomatic' ? 'Diplomático' : personality === 'commercial' ? 'Comercial' : 'Empático'}. ¿A quién vamos a responder?`;
      } 
      else if (l.includes('respond') || l.includes('hago') || l.includes('contest') || l.includes('dicho')) {
        if (currentResult) {
          if (personality === 'diplomatic') r = "DIPLOMÁTICO: 'Estimado usuario, agradecemos su feedback. Estamos procesando su caso con la mayor atención.'";
          else if (personality === 'commercial') r = "COMERCIAL: '¡Increíble noticia! Para celebrar su satisfacción, le ofrecemos un 20% de descuento en su próxima compra.'";
          else r = "EMPÁTICO: 'Sentimos mucho lo ocurrido. Estamos aquí para apoyarte y resolver esto juntos de inmediato.'";
        } else {
          r = "Realiza un escaneo primero para que pueda darte una respuesta personalizada.";
        }
      }
      else if (l.includes('ayuda') || l.includes('quien eres')) {
        r = "Soy un experto en NLP. Puedo redactar respuestas según mi personalidad activa. ¡Prueba a cambiar mi modo arriba!";
      }
      else {
        const chatSent = simulateAI(msg);
        if (chatSent.label === 'Triste') r = "Detecto tristeza. 😢 ¿Quieres que redacte algo empático?";
        else if (chatSent.label === 'Feliz') r = "¡Esa es la actitud! 😊 ¿Aprovechamos para una oferta comercial?";
        else r = `Entendido. Procesando bajo modo ${personality}.`;
      }
      setAiChat(prev => [...prev, { role: 'ia', text: r }]);
    }, 600);
  };

  return (
    <ErrorBoundary>
      <div translate="no" className="min-h-screen bg-[#020203] text-slate-300 font-sans flex overflow-hidden select-none">
        <Toaster position="top-right" />
        
        {/* SIDEBAR */}
        <aside className="w-20 lg:w-80 border-r border-white/5 bg-black/60 p-8 flex flex-col z-50">
          <div className="flex items-center gap-4 mb-20">
            <div className="p-4 bg-indigo-600 rounded-3xl"><Network className="w-8 h-8 text-white" /></div>
            <span className="hidden lg:block font-black text-xl tracking-tighter uppercase leading-tight">Análisis de <br /> Sentimientos</span>
          </div>

          <nav className="space-y-4 flex-1">
            <button onClick={() => setActiveTab('lab')} className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] transition-all ${activeTab === 'lab' ? 'bg-indigo-600 text-white' : 'text-slate-800'}`}><Search className="w-6 h-6" /><span className="hidden lg:block font-black text-xs uppercase tracking-widest">Scanner</span></button>
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-800'}`}><Activity className="w-6 h-6" /><span className="hidden lg:block font-black text-xs uppercase tracking-widest">Panel</span></button>
            <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-800'}`}><Database className="w-6 h-6" /><span className="hidden lg:block font-black text-xs uppercase tracking-widest">Memoria</span></button>
            <button onClick={() => setActiveTab('ai')} className={`w-full flex items-center gap-5 p-5 rounded-[1.5rem] transition-all ${activeTab === 'ai' ? 'bg-indigo-600 text-white' : 'text-slate-800'}`}><Bot className="w-6 h-6" /><span className="hidden lg:block font-black text-xs uppercase tracking-widest">Cortex IA</span></button>
          </nav>
          
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="flex items-center gap-2 p-4 text-[10px] font-black text-slate-800 hover:text-white uppercase"><RefreshCw className="w-3 h-3" /> Reset</button>
        </aside>

        <main className="flex-1 relative overflow-y-auto custom-scrollbar p-10 lg:p-20">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'lab' && (
              <div className="space-y-12">
                <header><h2 className="text-6xl lg:text-7xl font-black tracking-tighter uppercase italic leading-none">Análisis de <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-white to-indigo-500">Sentimientos</span></h2></header>
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                  <div className="xl:col-span-7 space-y-8">
                    <div className="bg-white/5 p-12 lg:p-16 rounded-[4rem] border border-white/10 relative overflow-hidden group">
                      <textarea value={text} onChange={(e) => setText(e.target.value)} disabled={loading} placeholder="Ingrese datos..." className="w-full h-72 bg-transparent text-3xl font-bold focus:outline-none resize-none placeholder:text-slate-900 disabled:opacity-30" />
                      <div className="mt-12 pt-12 border-t border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-4 text-slate-600 font-black text-[10px] uppercase">{loading ? 'Procesando...' : 'Núcleo Listo'}</div>
                        <button onClick={startScan} disabled={loading} className="px-16 py-7 bg-white text-black font-black rounded-[2.5rem] hover:bg-indigo-600 hover:text-white transition-all shadow-2xl">{loading ? 'ESPERE...' : 'ESCANEAR'}</button>
                      </div>
                    </div>
                    {currentResult && (
                      <div className="bg-indigo-600 p-12 rounded-[4.5rem] shadow-2xl">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-4 flex items-center gap-2"><Zap className="w-4 h-4 fill-current" /> Recomendación IA</h4>
                        <p className="text-2xl font-bold text-white leading-relaxed">{currentResult.recommendation}</p>
                      </div>
                    )}
                  </div>
                  <div className="xl:col-span-5">
                    {currentResult ? (
                      <div className="bg-white/5 p-12 rounded-[4.5rem] border border-white/10 space-y-12 shadow-2xl">
                        <div className="flex flex-col items-center">
                          <div className="p-12 bg-black rounded-[3.5rem] border border-white/5 mb-10 text-6xl flex items-center justify-center">
                            {currentResult.emoji}
                          </div>
                          <h3 className={`text-6xl font-black uppercase tracking-tighter ${currentResult.color}`}>
                            {currentResult.label}
                          </h3>
                          <div className="text-[10px] font-black uppercase text-slate-700 tracking-widest mt-4">Confianza: {(currentResult.score * 100).toFixed(0)}%</div>
                        </div>
                        <div className="h-64 border-t border-white/5 pt-10">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={currentResult.emotions}>
                              <PolarGrid stroke="#ffffff10" />
                              <PolarAngleAxis dataKey="name" tick={{ fill: '#334155', fontSize: 10, fontWeight: 900 }} />
                              <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : <div className="h-full border-2 border-dashed border-white/5 rounded-[4.5rem] flex flex-col items-center justify-center opacity-10"><Cpu className="w-20 h-20 animate-spin" style={{animationDuration:'10s'}} /><p className="font-black uppercase text-sm mt-6">Esperando Inferencia</p></div>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <div className="space-y-12">
                <h2 className="text-6xl font-black tracking-tighter">Panel <span className="text-indigo-600">ML</span></h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="bg-white/5 p-12 rounded-[4rem] h-[500px] border border-white/10"><ResponsiveContainer width="100%" height="100%"><AreaChart data={history.slice(0,10).reverse().map(h => ({ name: h.date, score: h.score }))}><Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={5} fill="#6366f120" /></AreaChart></ResponsiveContainer></div>
                  <div className="bg-white/5 p-12 rounded-[4rem] h-[500px] flex flex-col items-center justify-center"><div className="text-[10rem] font-black italic tracking-tighter leading-none">{history.length}</div><span className="text-xs font-black uppercase text-indigo-500 tracking-[0.5em] mt-4">Analizados</span></div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <h2 className="text-6xl font-black tracking-tighter uppercase italic">Memoria <span className="text-indigo-500">Neural</span></h2>
                <div className="space-y-4">
                  {history.map(item => (
                    <div key={item.id} className="bg-white/5 p-10 rounded-[3rem] border border-white/5 flex justify-between items-center"><div className="flex-1"><span className="text-[10px] font-black text-slate-800 uppercase block mb-2">{item.date}</span><p className="text-2xl font-bold italic">"{item.text}"</p></div><div className={`w-3 h-12 rounded-full ${parseInt(item.label) >= 4 ? 'bg-green-500' : 'bg-red-500'}`} /></div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="h-[80vh] flex flex-col bg-[#050508] border border-indigo-500/20 rounded-[4rem] overflow-hidden shadow-2xl">
                <header className="p-10 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-black/40">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center animate-pulse"><Bot className="w-8 h-8 text-white" /></div>
                    <div><h2 className="text-3xl font-black uppercase tracking-tighter">Cortex IA</h2><p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Personalidad Activa</p></div>
                  </div>
                  <div className="flex bg-black/60 p-2 rounded-2xl border border-white/5">
                    <button onClick={() => setPersonality('diplomatic')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${personality === 'diplomatic' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:text-white'}`}>Diplomático</button>
                    <button onClick={() => setPersonality('commercial')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${personality === 'commercial' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:text-white'}`}>Comercial</button>
                    <button onClick={() => setPersonality('empathy')} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${personality === 'empathy' ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:text-white'}`}>Empático</button>
                  </div>
                </header>
                <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
                  {aiChat.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'ia' ? 'justify-start' : 'justify-end'}`}><div className={`max-w-[75%] p-8 rounded-[3rem] ${msg.role === 'ia' ? 'bg-white/5 border border-white/10' : 'bg-indigo-600 text-white'}`}><p className="text-lg font-bold italic">{msg.text}</p></div></div>
                  ))}
                </div>
                <div className="p-12 bg-black/80 border-t border-white/5 flex gap-4">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAiChat()} placeholder="Consultar..." className="w-full bg-white/5 border border-white/10 p-8 rounded-[2.5rem] text-lg font-bold focus:outline-none" />
                  <button onClick={handleAiChat} className="p-8 bg-indigo-600 text-white rounded-[2rem]"><Send className="w-6 h-6" /></button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
