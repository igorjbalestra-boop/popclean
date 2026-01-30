'use client';

import { useState, useEffect } from 'react';
import { Home, User, Shield, MapPin, Plus, Settings, LogOut, Loader2, Star, Mail, Lock, Eye, EyeOff, ArrowLeft, Phone, ChevronRight, Check, MessageSquare, CheckCircle, Search, Zap, Navigation, Bell, TrendingUp, Calendar, Clock, DollarSign } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// ============ CONSTANTS ============
const PRICING_RULES = {
  byArea: [
    { max: 50, price: 110 }, { max: 80, price: 130 }, { max: 120, price: 160 },
    { max: 180, price: 200 }, { max: 250, price: 260 }, { max: Infinity, price: 320 }
  ],
  multipliers: { apartment: 1.0, house: 1.1, townhouse: 1.2 },
  extras: { stairs: 20, yard: 30, extraBathroom: 15, petSmall: 20, petMedium: 35, petLarge: 35, heavyDirt: 40, postConstruction: 120 }
};

const PLATFORM_FEES = { intermediation: 0.05, protection: 0.04, financial: 0.02, total: 0.11 };

const calculatePrice = (property) => {
  if (!property || !property.area) return 0;
  let basePrice = PRICING_RULES.byArea.find(r => property.area <= r.max)?.price || 320;
  basePrice *= PRICING_RULES.multipliers[property.type] || 1.0;
  if (property.hasStairs) basePrice += PRICING_RULES.extras.stairs;
  if (property.hasYard) basePrice += PRICING_RULES.extras.yard;
  if (property.bathrooms > 1) basePrice += PRICING_RULES.extras.extraBathroom * (property.bathrooms - 1);
  if (property.pets === 'small') basePrice += PRICING_RULES.extras.petSmall;
  if (property.pets === 'medium' || property.pets === 'large') basePrice += PRICING_RULES.extras.petMedium;
  if (property.dirtLevel === 'heavy') basePrice += PRICING_RULES.extras.heavyDirt;
  return Math.round(basePrice);
};

const calculateFees = (amount) => {
  const totalFees = amount * PLATFORM_FEES.total;
  return {
    serviceAmount: amount,
    intermediation: (amount * PLATFORM_FEES.intermediation).toFixed(2),
    protection: (amount * PLATFORM_FEES.protection).toFixed(2),
    financial: (amount * PLATFORM_FEES.financial).toFixed(2),
    totalFees: totalFees.toFixed(2),
    clientTotal: (amount + totalFees).toFixed(2),
    providerNet: amount.toFixed(2)
  };
};

// ============ SUPABASE CLIENT ============
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

// ============ MAIN APP ============
export default function PopcleanApp() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [providers, setProviders] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [offers, setOffers] = useState([]);
  const [jobStatus, setJobStatus] = useState('waiting');
  const [rating, setRating] = useState(0);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setCurrentScreen('login');
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setProfile(data);
      setCurrentScreen(data.role === 'provider' ? 'provider-dashboard' : 'map');
      loadProviders();
    }
  };

  const loadProviders = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'provider');
    setProviders(data || []);
  };

  const handleSignUp = async (email, password, userData) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: userData }
    });
    if (error) {
      alert(error.message);
      setLoading(false);
      return false;
    }
    return true;
  };

  const handleSignIn = async (email, password) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert('Email ou senha incorretos');
      setLoading(false);
      return false;
    }
    return true;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setCurrentScreen('login');
  };

  const handleCreateProperty = async (propertyData) => {
    const { data, error } = await supabase.from('properties').insert({
      owner_id: user.id,
      ...propertyData
    }).select().single();
    
    if (data) {
      setProperties([...properties, data]);
      setSelectedProperty(data);
      setCurrentScreen('request-service');
    }
  };

  const handleRequestService = () => {
    const estimatedPrice = calculatePrice(selectedProperty);
    const newJob = {
      id: `job_${Date.now()}`,
      property: selectedProperty,
      estimatedPrice,
      fees: calculateFees(estimatedPrice),
      status: 'waiting',
      createdAt: new Date()
    };
    setActiveJob(newJob);
    
    setTimeout(() => {
      if (providers.length > 0) {
        setOffers([
          { id: 'o1', provider: providers[0] || { full_name: 'Maria Santos', rating: 4.9, completed_jobs: 156 }, price: estimatedPrice, message: 'Aceito pelo preço sugerido!' },
          { id: 'o2', provider: providers[1] || { full_name: 'Ana Costa', rating: 4.8, completed_jobs: 89 }, price: estimatedPrice + 20, message: 'Posso fazer por esse valor.' }
        ]);
      }
    }, 2000);
    
    setCurrentScreen('waiting-offers');
  };

  const handleAcceptOffer = (offer) => {
    setActiveJob({ ...activeJob, provider: offer.provider, finalPrice: offer.price, finalFees: calculateFees(offer.price) });
    setJobStatus('confirmed');
    setCurrentScreen('job-active');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5f7a] to-[#3a7d8f] flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="animate-spin mx-auto mb-4" size={48} />
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user || currentScreen === 'login') {
    return <AuthScreen onSignIn={handleSignIn} onSignUp={handleSignUp} loading={loading} />;
  }

  if (profile?.role === 'client') {
    if (currentScreen === 'add-property') {
      return <PropertyForm onSubmit={handleCreateProperty} onCancel={() => setCurrentScreen('map')} />;
    }
    if (currentScreen === 'request-service' && selectedProperty) {
      return <RequestServiceScreen property={selectedProperty} providers={providers} onRequest={handleRequestService} onBack={() => setCurrentScreen('map')} />;
    }
    if (currentScreen === 'waiting-offers') {
      return <WaitingOffersScreen offers={offers} onAccept={handleAcceptOffer} providers={providers} />;
    }
    if (currentScreen === 'job-active') {
      return <JobActiveScreen job={activeJob} status={jobStatus} onStatusChange={setJobStatus} onComplete={() => setCurrentScreen('rating')} />;
    }
    if (currentScreen === 'rating') {
      return <RatingScreen job={activeJob} rating={rating} onRatingChange={setRating} onSubmit={() => { setCurrentScreen('map'); setActiveJob(null); setOffers([]); setRating(0); }} />;
    }
    return <ClientDashboard profile={profile} providers={providers} onRequestService={() => setCurrentScreen('add-property')} onSignOut={handleSignOut} />;
  }

  if (profile?.role === 'provider') {
    return <ProviderDashboard profile={profile} onSignOut={handleSignOut} />;
  }

  return <AuthScreen onSignIn={handleSignIn} onSignUp={handleSignUp} loading={loading} />;
}

function AuthScreen({ onSignIn, onSignUp, loading }) {
  const [mode, setMode] = useState('select');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', fullName: '', phone: '', role: 'client' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { setError('Preencha todos os campos'); return; }
    await onSignIn(formData.email, formData.password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) { setError('Preencha todos os campos'); return; }
    if (formData.password !== formData.confirmPassword) { setError('As senhas não coincidem'); return; }
    if (formData.password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres'); return; }
    await onSignUp(formData.email, formData.password, { full_name: formData.fullName, phone: formData.phone, role: formData.role });
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5f7a] to-[#3a7d8f] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mb-6 bg-gradient-to-br from-[#1e3a5f] to-[#3a7d8f] rounded-2xl p-4 inline-block">
              <Home className="text-white h-20 w-20" />
            </div>
            <h1 className="text-3xl font-bold text-[#1e3a5f] mb-2">POPCLEAN</h1>
            <p className="text-gray-600 text-sm">Marketplace de Serviços Domésticos</p>
          </div>
          <div className="space-y-3">
            <button onClick={() => { setFormData({ ...formData, role: 'client' }); setMode('login'); }} className="w-full bg-[#3a7d8f] text-white py-4 rounded-xl font-semibold hover:bg-[#2d5f7a] transition-all flex items-center justify-center gap-2 shadow-lg">
              <User size={20} /> Entrar como Cliente
            </button>
            <button onClick={() => { setFormData({ ...formData, role: 'provider' }); setMode('login'); }} className="w-full bg-[#1e3a5f] text-white py-4 rounded-xl font-semibold hover:bg-[#2d5f7a] transition-all flex items-center justify-center gap-2 shadow-lg">
              <Shield size={20} /> Entrar como Prestador
            </button>
          </div>
          <div className="border-t pt-4 mt-6 text-center text-xs text-gray-500">
            <p className="font-semibold text-gray-700">Service Box Operações Ltda</p>
            <p className="text-[#3a7d8f]">Tecnologia: Lumio IP & Branding • v2.0</p>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5f7a] to-[#3a7d8f] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <button onClick={() => setMode('select')} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-[#3a7d8f]">
            <ArrowLeft size={20} /> Voltar
          </button>
          <div className="text-center mb-6">
            <div className="mb-4 bg-gradient-to-br from-[#1e3a5f] to-[#3a7d8f] rounded-2xl p-3 inline-block">
              {formData.role === 'client' ? <User className="text-white h-12 w-12" /> : <Shield className="text-white h-12 w-12" />}
            </div>
            <h2 className="text-2xl font-bold text-[#1e3a5f]">{formData.role === 'client' ? 'Área do Cliente' : 'Área do Prestador'}</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3a7d8f] outline-none" placeholder="seu@email.com" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3a7d8f] outline-none" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-[#3a7d8f] text-white py-4 rounded-xl font-semibold hover:bg-[#2d5f7a] transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="animate-spin" size={20} /> Entrando...</> : 'Entrar'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">Não tem conta? <button onClick={() => setMode('register')} className="text-[#3a7d8f] font-semibold hover:underline">Cadastre-se</button></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5f7a] to-[#3a7d8f] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <button onClick={() => setMode('login')} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-[#3a7d8f]">
          <ArrowLeft size={20} /> Voltar
        </button>
        <h2 className="text-2xl font-bold text-[#1e3a5f] text-center mb-6">{formData.role === 'client' ? 'Cadastro de Cliente' : 'Cadastro de Prestador'}</h2>
        <form onSubmit={handleRegister} className="space-y-4">
          <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3a7d8f] outline-none" placeholder="Nome completo" />
          <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3a7d8f] outline-none" placeholder="Telefone" />
          <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3a7d8f] outline-none" placeholder="Email" />
          <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3a7d8f] outline-none" placeholder="Senha (mín. 6 caracteres)" />
          <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3a7d8f] outline-none" placeholder="Confirmar senha" />
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-[#3a7d8f] text-white py-4 rounded-xl font-semibold disabled:opacity-50">{loading ? 'Criando conta...' : 'Criar Conta'}</button>
        </form>
      </div>
    </div>
  );
}

function ClientDashboard({ profile, providers, onRequestService, onSignOut }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm p-4 flex items-center justify-between border-b-2 border-[#3a7d8f]">
        <div>
          <p className="text-xs text-gray-500">Olá,</p>
          <p className="font-semibold text-[#1e3a5f]">{profile?.full_name || 'Cliente'}</p>
        </div>
        <button onClick={onSignOut} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-red-500"><LogOut size={20} /></button>
      </div>
      <div className="flex-1 relative bg-gradient-to-br from-green-50 to-blue-50">
        <div className="absolute inset-0 flex items-center justify-center"><MapPin className="text-[#3a7d8f]" size={48} /></div>
        {providers.slice(0, 4).map((p, idx) => (
          <div key={p.id || idx} className="absolute bg-white rounded-full p-3 shadow-lg border-2 border-[#3a7d8f] animate-pulse" style={{ top: `${20 + idx * 18}%`, left: `${25 + idx * 15}%` }}>
            <Shield className="text-[#3a7d8f]" size={20} />
          </div>
        ))}
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Prestadores Online</span>
            <span className="text-2xl font-bold text-[#3a7d8f]">{providers.length}</span>
          </div>
        </div>
      </div>
      <div className="p-6 bg-white border-t shadow-lg">
        <button onClick={onRequestService} className="w-full bg-gradient-to-r from-[#3a7d8f] to-[#2d5f7a] text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2">
          <Plus size={22} /> Solicitar Serviço
        </button>
      </div>
    </div>
  );
}

function PropertyForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({ type: 'house', area: '', floors: 1, bathrooms: 1, hasStairs: false, hasYard: false, pets: 'none', dirtLevel: 'medium', address: '' });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 border-b flex items-center gap-3">
        <button onClick={onCancel} className="p-2"><ChevronRight className="rotate-180" size={24} /></button>
        <h1 className="font-semibold text-lg">Cadastrar Imóvel</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">Tipo</label>
            <div className="grid grid-cols-3 gap-3">
              {[{ value: 'apartment', label: 'Apto' }, { value: 'house', label: 'Casa' }, { value: 'townhouse', label: 'Sobrado' }].map(type => (
                <button key={type.value} onClick={() => setFormData({ ...formData, type: type.value })} className={`p-4 rounded-xl border-2 ${formData.type === type.value ? 'border-[#3a7d8f] bg-blue-50' : 'border-gray-200'}`}>
                  <Home className="mx-auto mb-2" size={24} /><p className="text-xs font-semibold">{type.label}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Área (m²)</label>
            <input type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#3a7d8f] outline-none" placeholder="Ex: 120" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-2">Banheiros</label>
              <select value={formData.bathrooms} onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300">
                <option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4+</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Sujeira</label>
              <select value={formData.dirtLevel} onChange={(e) => setFormData({ ...formData, dirtLevel: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300">
                <option value="light">Leve</option><option value="medium">Média</option><option value="heavy">Pesada</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200">
              <span>Tem escadas</span>
              <input type="checkbox" checked={formData.hasStairs} onChange={(e) => setFormData({ ...formData, hasStairs: e.target.checked })} className="w-5 h-5" />
            </label>
            <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200">
              <span>Tem quintal</span>
              <input type="checkbox" checked={formData.hasYard} onChange={(e) => setFormData({ ...formData, hasYard: e.target.checked })} className="w-5 h-5" />
            </label>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Endereço</label>
            <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 resize-none" rows="2" placeholder="Rua, número, bairro" />
          </div>
          {formData.area && (
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#3a7d8f] rounded-xl p-6 text-white">
              <p className="text-sm opacity-90">Preço Estimado</p>
              <p className="text-4xl font-bold">R$ {calculatePrice({ ...formData, area: parseInt(formData.area) })},00</p>
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t">
        <button onClick={() => onSubmit({ ...formData, area: parseInt(formData.area) })} disabled={!formData.area || !formData.address} className="w-full bg-[#3a7d8f] text-white py-4 rounded-xl font-semibold disabled:opacity-50">Cadastrar Imóvel</button>
      </div>
    </div>
  );
}

function RequestServiceScreen({ property, providers, onRequest, onBack }) {
  const price = calculatePrice(property);
  const fees = calculateFees(price);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 border-b flex items-center gap-3">
        <button onClick={onBack} className="p-2"><ChevronRight className="rotate-180" size={24} /></button>
        <h1 className="font-semibold text-lg">Solicitar Serviço</h1>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-[#3a7d8f] rounded-xl p-6 mb-4 text-white">
          <p className="text-sm opacity-90">Preço Estimado</p>
          <p className="text-5xl font-bold mb-4">R$ {price},00</p>
          <div className="bg-white bg-opacity-10 rounded-lg p-4 text-sm">
            <div className="flex justify-between"><span>Serviço</span><span>R$ {fees.serviceAmount.toFixed(2)}</span></div>
            <div className="flex justify-between text-xs opacity-80"><span>Taxas (11%)</span><span>R$ {fees.totalFees}</span></div>
            <div className="border-t border-white border-opacity-30 pt-2 mt-2 flex justify-between font-bold text-lg">
              <span>Total</span><span>R$ {fees.clientTotal}</span>
            </div>
          </div>
        </div>
        <h3 className="font-semibold mb-3">Prestadores Disponíveis</h3>
        {providers.slice(0, 3).map((provider, idx) => (
          <div key={provider.id || idx} className="bg-white rounded-xl p-4 mb-3 shadow-sm flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#3a7d8f] to-[#2d5f7a] rounded-full p-3"><User className="text-white" size={24} /></div>
            <div className="flex-1">
              <p className="font-semibold">{provider.full_name || 'Prestador'}</p>
              <div className="flex gap-3 text-xs text-gray-600">
                <span className="flex items-center gap-1"><Star className="text-yellow-400" size={12} fill="currentColor" /> {provider.rating || '5.0'}</span>
                <span>{provider.completed_jobs || 0} serviços</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t">
        <button onClick={onRequest} className="w-full bg-gradient-to-r from-[#3a7d8f] to-[#2d5f7a] text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2">
          <Zap size={20} /> Chamar Prestadores
        </button>
      </div>
    </div>
  );
}

function WaitingOffersScreen({ offers, onAccept, providers }) {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="text-center py-8">
        {offers.length === 0 ? (
          <>
            <div className="relative inline-block mb-6">
              <div className="animate-ping absolute inline-flex h-24 w-24 rounded-full bg-[#3a7d8f] opacity-75"></div>
              <div className="relative inline-flex rounded-full h-24 w-24 bg-gradient-to-br from-[#3a7d8f] to-[#2d5f7a] items-center justify-center shadow-lg">
                <Search className="text-white" size={40} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Procurando prestadores...</h3>
            <p className="text-gray-600">Notificando {providers.length} prestadores</p>
          </>
        ) : (
          <>
            <div className="bg-green-50 rounded-xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="text-green-500" size={28} />
              <div><p className="font-bold text-green-800">{offers.length} Propostas Recebidas!</p></div>
            </div>
            {offers.map(offer => (
              <div key={offer.id} className="bg-white rounded-xl p-5 mb-4 shadow-md text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gradient-to-br from-[#3a7d8f] to-[#2d5f7a] rounded-full p-3"><User className="text-white" size={24} /></div>
                  <div>
                    <p className="font-bold">{offer.provider.full_name}</p>
                    <div className="flex gap-2 text-xs text-gray-600">
                      <span className="flex items-center gap-1"><Star className="text-yellow-400" size={12} fill="currentColor" /> {offer.provider.rating}</span>
                      <span>{offer.provider.completed_jobs} serviços</span>
                    </div>
                  </div>
                  <p className="ml-auto text-2xl font-bold text-[#3a7d8f]">R$ {offer.price}</p>
                </div>
                <p className="text-sm text-gray-600 mb-3">"{offer.message}"</p>
                <button onClick={() => onAccept(offer)} className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <Check size={20} /> Aceitar
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function JobActiveScreen({ job, status, onStatusChange, onComplete }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#3a7d8f] p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Serviço em Andamento</p>
            <p className="font-bold text-lg">#{job?.id?.slice(-6)}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${status === 'confirmed' ? 'bg-yellow-400 text-yellow-900' : status === 'enroute' ? 'bg-blue-400 text-blue-900' : 'bg-green-400 text-green-900'}`}>
            {status === 'confirmed' ? 'Confirmado' : status === 'enroute' ? 'A caminho' : 'Em execução'}
          </div>
        </div>
      </div>
      <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 relative flex items-center justify-center">
        <MapPin className="text-blue-500" size={48} />
        {status === 'enroute' && <Navigation className="absolute animate-bounce text-[#3a7d8f]" size={32} />}
      </div>
      <div className="p-4">
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#3a7d8f] to-[#2d5f7a] rounded-full p-4"><User className="text-white" size={32} /></div>
            <div>
              <p className="font-semibold text-lg">{job?.provider?.full_name}</p>
              <div className="flex items-center gap-2"><Star className="text-yellow-400" size={14} fill="currentColor" /><span>{job?.provider?.rating}</span></div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {status === 'confirmed' && <button onClick={() => onStatusChange('enroute')} className="w-full bg-gray-200 py-3 rounded-xl">[Demo] Prestador a caminho</button>}
          {status === 'enroute' && <button onClick={() => onStatusChange('in_progress')} className="w-full bg-gray-200 py-3 rounded-xl">[Demo] Check-in realizado</button>}
          {status === 'in_progress' && <button onClick={onComplete} className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold">Concluir Serviço</button>}
        </div>
      </div>
    </div>
  );
}

function RatingScreen({ job, rating, onRatingChange, onSubmit }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
        <CheckCircle size={48} className="mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Serviço Concluído!</h2>
        <p className="opacity-90">Avalie {job?.provider?.full_name}</p>
      </div>
      <div className="flex-1 p-4 pb-32">
        <div className="bg-white rounded-xl p-6 mb-4">
          <p className="text-center mb-4 font-medium">Como foi o serviço?</p>
          <div className="flex justify-center gap-3 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => onRatingChange(star)}>
                <Star size={40} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'} fill={star <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4">
          <h3 className="font-semibold mb-2">Resumo</h3>
          <div className="flex justify-between text-sm"><span>Serviço:</span><span>R$ {job?.finalPrice?.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm text-gray-500"><span>Taxas:</span><span>R$ {job?.finalFees?.totalFees}</span></div>
          <div className="border-t pt-2 mt-2 flex justify-between font-bold"><span>Total:</span><span className="text-[#3a7d8f]">R$ {job?.finalFees?.clientTotal}</span></div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t">
        <button onClick={onSubmit} disabled={rating === 0} className="w-full bg-[#3a7d8f] text-white py-4 rounded-xl font-semibold disabled:opacity-50">
          {rating === 0 ? 'Selecione uma avaliação' : 'Enviar Avaliação'}
        </button>
      </div>
    </div>
  );
}

function ProviderDashboard({ profile, onSignOut }) {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#3a7d8f] p-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 rounded-full p-2"><Shield size={24} /></div>
            <div>
              <p className="font-semibold">{profile?.full_name || 'Prestador'}</p>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <Star className="text-yellow-400" size={14} fill="currentColor" />
                <span>{profile?.rating || '5.0'}</span>
                <span className="mx-1">•</span>
                <span>{profile?.completed_jobs || 0} serviços</span>
              </div>
            </div>
          </div>
          <button onClick={onSignOut} className="p-2 rounded-full bg-white bg-opacity-20"><LogOut size={20} /></button>
        </div>
        <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-xl p-3">
          <span className="text-sm font-medium">Status</span>
          <button onClick={() => setIsOnline(!isOnline)} className={`px-4 py-1 rounded-full text-sm font-semibold ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}>
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>
      </div>
      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <TrendingUp className="mx-auto text-green-500 mb-1" size={20} />
          <p className="text-lg font-bold">R$ 0</p>
          <p className="text-xs text-gray-500">Ganhos</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <CheckCircle className="mx-auto text-blue-500 mb-1" size={20} />
          <p className="text-lg font-bold">0</p>
          <p className="text-xs text-gray-500">Concluídos</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <Bell className="mx-auto text-orange-500 mb-1" size={20} />
          <p className="text-lg font-bold">0</p>
          <p className="text-xs text-gray-500">Disponíveis</p>
        </div>
      </div>
      <div className="flex-1 p-4">
        <div className="text-center py-12 text-gray-500">
          <Calendar className="mx-auto mb-3 opacity-50" size={48} />
          <p>Nenhum serviço disponível</p>
          <p className="text-sm">Novos serviços aparecerão aqui</p>
        </div>
      </div>
    </div>
  );
}
