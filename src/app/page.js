'use client'
import React, { useState, useEffect } from 'react';
import { MapPin, Home, User, Wallet, Star, MessageSquare, Camera, Clock, DollarSign, Check, X, Menu, Search, Filter, Plus, ChevronRight, AlertCircle, Shield, Navigation, CreditCard, Zap, TrendingUp, Users, FileText, Settings, LogOut, Phone, Mail, Calendar, CheckCircle, XCircle, AlertTriangle, Download, Upload, Edit, Eye, BarChart3, PieChart } from 'lucide-react';

const PRICING_RULES = {
  byArea: [
    { max: 50, price: 110 }, { max: 80, price: 130 }, { max: 120, price: 160 },
    { max: 180, price: 200 }, { max: 250, price: 260 }, { max: Infinity, price: 320 }
  ],
  multipliers: { apartment: 1.0, house: 1.1, townhouse: 1.2 },
  extras: { stairs: 20, yard: 30, extraBathroom: 15, petSmall: 20, petMedium: 35, petLarge: 35, heavyDirt: 40, postConstruction: 120 }
};

const PLATFORM_FEES = { intermediation: 0.05, protection: 0.04, financial: 0.02, total: 0.11 };
const ROYALTY_LUMIO = 0.04;

const mockUsers = {
  clients: [{ id: 'c1', name: 'João Silva', email: 'joao@email.com', phone: '62999999999', role: 'client', verified: true }],
  providers: [
    { id: 'p1', name: 'Maria Santos', rating: 4.9, completedJobs: 156, verified: true },
    { id: 'p2', name: 'Ana Costa', rating: 4.8, completedJobs: 89, verified: true },
    { id: 'p3', name: 'Carlos Souza', rating: 5.0, completedJobs: 203, verified: true }
  ],
  admins: [{ id: 'a1', name: 'Admin Master', role: 'admin_master' }]
};

export default function PopcleanApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [properties, setProperties] = useState([]);
  const [wallet, setWallet] = useState({ balance: 150, blocked: 0 });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [nearbyProviders, setNearbyProviders] = useState([]);

  const calculatePrice = (property) => {
    if (!property) return 0;
    let basePrice = PRICING_RULES.byArea.find(r => property.area <= r.max)?.price || 320;
    basePrice *= PRICING_RULES.multipliers[property.type] || 1.0;
    if (property.hasStairs) basePrice += PRICING_RULES.extras.stairs;
    if (property.hasYard) basePrice += PRICING_RULES.extras.yard;
    if (property.bathrooms > 1) basePrice += PRICING_RULES.extras.extraBathroom * (property.bathrooms - 1);
    if (property.pets === 'small') basePrice += PRICING_RULES.extras.petSmall;
    if (property.pets === 'medium' || property.pets === 'large') basePrice += PRICING_RULES.extras.petMedium;
    if (property.dirtLevel === 'heavy') basePrice += PRICING_RULES.extras.heavyDirt;
    if (property.serviceType === 'post-construction') basePrice += PRICING_RULES.extras.postConstruction;
    return Math.round(basePrice);
  };

  const calculateFees = (amount) => {
    const intermediation = amount * PLATFORM_FEES.intermediation;
    const protection = amount * PLATFORM_FEES.protection;
    const financial = amount * PLATFORM_FEES.financial;
    const totalFees = intermediation + protection + financial;
    const royaltyLumio = totalFees * ROYALTY_LUMIO;
    return {
      serviceAmount: amount,
      intermediation: intermediation.toFixed(2),
      protection: protection.toFixed(2),
      financial: financial.toFixed(2),
      totalFees: totalFees.toFixed(2),
      royaltyLumio: royaltyLumio.toFixed(2),
      clientTotal: (amount + totalFees).toFixed(2),
      providerNet: amount.toFixed(2)
    };
  };

  useEffect(() => {
    if (currentUser?.role === 'client') {
      setNearbyProviders(mockUsers.providers.map((p, idx) => ({
        ...p, distance: (1.2 + idx * 0.8).toFixed(1), available: true
      })));
    }
  }, [currentUser]);

  const LoginScreen = () => (
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
          <button onClick={() => { setCurrentUser(mockUsers.clients[0]); setCurrentScreen('map'); }}
            className="w-full bg-[#3a7d8f] text-white py-4 rounded-xl font-semibold hover:bg-[#2d5f7a] transition-all flex items-center justify-center gap-2 shadow-lg">
            <User size={20} /> Entrar como Cliente
          </button>
          <button onClick={() => { setCurrentUser(mockUsers.providers[0]); setCurrentScreen('provider-dashboard'); }}
            className="w-full bg-[#1e3a5f] text-white py-4 rounded-xl font-semibold hover:bg-[#2d5f7a] transition-all flex items-center justify-center gap-2 shadow-lg">
            <Shield size={20} /> Entrar como Prestador
          </button>
          <button onClick={() => { setCurrentUser(mockUsers.admins[0]); setCurrentScreen('admin-dashboard'); }}
            className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
            <Settings size={20} /> Painel Admin
          </button>
        </div>
        <div className="border-t pt-4 mt-6 text-center text-xs text-gray-500">
          <p className="font-semibold text-gray-700">Service Box Operações Ltda</p>
          <p className="text-[#3a7d8f]">Tecnologia: Lumio IP & Branding • v1.0</p>
        </div>
      </div>
    </div>
  );

  const MapScreen = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm p-4 flex items-center justify-between border-b-2 border-[#3a7d8f]">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-[#3a7d8f] to-[#2d5f7a] rounded-full p-2">
            <User className="text-white" size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Olá,</p>
            <p className="font-semibold text-[#1e3a5f]">{currentUser?.name}</p>
          </div>
        </div>
        <button onClick={() => setCurrentScreen('profile')} className="p-2 rounded-full bg-gray-100">
          <Settings size={20} className="text-[#1e3a5f]" />
        </button>
      </div>
      <div className="flex-1 relative bg-gradient-to-br from-green-50 to-blue-50">
        <div className="absolute inset-0 flex items-center justify-center">
          <MapPin className="text-[#3a7d8f]" size={48} />
        </div>
        {nearbyProviders.slice(0, 4).map((p, idx) => (
          <div key={p.id} className="absolute bg-white rounded-full p-3 shadow-lg border-2 border-[#3a7d8f] animate-pulse"
            style={{ top: `${20 + idx * 18}%`, left: `${25 + idx * 15}%` }}>
            <Shield className="text-[#3a7d8f]" size={20} />
          </div>
        ))}
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Prestadores Online</span>
            <span className="text-2xl font-bold text-[#3a7d8f]">{nearbyProviders.length}</span>
          </div>
        </div>
      </div>
      <div className="p-6 bg-white border-t shadow-lg">
        <button onClick={() => alert('Em breve: Cadastro de imóveis!')}
          className="w-full bg-gradient-to-r from-[#3a7d8f] to-[#2d5f7a] text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2">
          <Plus size={22} /> Solicitar Serviço
        </button>
      </div>
    </div>
  );

  const ProfileScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#3a7d8f] p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white rounded-full p-4">
            <User className="text-[#3a7d8f]" size={32} />
          </div>
          <div>
            <p className="font-bold text-lg">{currentUser?.name}</p>
            <p className="text-sm opacity-90">{currentUser?.email}</p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <button onClick={() => { setCurrentUser(null); setCurrentScreen('login'); }}
          className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mt-4">
          <LogOut size={18} /> Sair
        </button>
      </div>
    </div>
  );

  const AdminDashboard = () => {
    const totalGMV = 45000;
    const platformRevenue = totalGMV * 0.11;
    const royaltyLumio = platformRevenue * 0.04;
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#3a7d8f] p-6 text-white">
          <h1 className="font-bold text-xl">Painel Admin - POPCLEAN</h1>
        </div>
        <div className="p-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-600">GMV Mês</p>
            <p className="text-2xl font-bold">R$ {totalGMV.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-600">Receita (11%)</p>
            <p className="text-2xl font-bold">R$ {platformRevenue.toLocaleString('pt-BR')}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-600">Serviços</p>
            <p className="text-2xl font-bold">12</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-600">Royalty Lumio</p>
            <p className="text-2xl font-bold text-orange-600">R$ {royaltyLumio.toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {currentScreen === 'login' && <LoginScreen />}
      {currentScreen === 'map' && <MapScreen />}
      {currentScreen === 'profile' && <ProfileScreen />}
      {currentScreen === 'admin-dashboard' && <AdminDashboard />}
      {currentScreen === 'provider-dashboard' && <div className="p-8 text-center"><p>Dashboard Prestador</p></div>}
    </div>
  );
}
