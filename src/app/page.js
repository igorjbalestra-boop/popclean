'use client'
import React, { useState, useEffect } from 'react';
import { MapPin, Home, User, Wallet, Star, MessageSquare, Camera, Clock, DollarSign, Check, X, Menu, Search, Filter, Plus, ChevronRight, AlertCircle, Shield, Navigation, CreditCard, Zap, TrendingUp, Users, FileText, Settings, LogOut, Phone, Mail, Calendar, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
    { id: 'p1', name: 'Maria Santos', rating: 4.9, completedJobs: 156, verified: true, distance: '1.2' },
    { id: 'p2', name: 'Ana Costa', rating: 4.8, completedJobs: 89, verified: true, distance: '2.5' },
    { id: 'p3', name: 'Carlos Souza', rating: 5.0, completedJobs: 203, verified: true, distance: '1.8' }
  ],
  admins: [{ id: 'a1', name: 'Admin Master', role: 'admin_master' }]
};

export default function PopcleanApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeJob, setActiveJob] = useState(null);
  const [offers, setOffers] = useState([]);
  const [jobStatus, setJobStatus] = useState('waiting');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [wallet, setWallet] = useState({ balance: 150, blocked: 0 });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [formData, setFormData] = useState({
    type: 'house', area: '', floors: 1, bathrooms: 1, hasStairs: false, hasYard: false,
    pets: 'none', dirtLevel: 'medium', serviceType: 'regular', address: '', notes: ''
  });

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
      setNearbyProviders(mockUsers.providers.map(p => ({ ...p, available: true })));
    }
  }, [currentUser]);

  const handleAddProperty = () => {
    const newProperty = { id: `prop_${Date.now()}`, ...formData, area: parseInt(formData.area), userId: currentUser.id };
    setProperties([...properties, newProperty]);
    setSelectedProperty(newProperty);
    setShowAddProperty(false);
    setCurrentScreen('request-service');
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
      setOffers([
        { id: 'o1', provider: nearbyProviders[0], price: estimatedPrice, message: 'Aceito pelo preço sugerido!' },
        { id: 'o2', provider: nearbyProviders[1], price: estimatedPrice + 20, message: `Posso fazer por R$ ${estimatedPrice + 20} devido ao deslocamento.` }
      ]);
    }, 2000);
    setCurrentScreen('waiting-offers');
  };

  const handleAcceptOffer = (offer) => {
    setActiveJob({ ...activeJob, provider: offer.provider, finalPrice: offer.price, finalFees: calculateFees(offer.price) });
    setJobStatus('confirmed');
    setCurrentScreen('job-active');
  };

  // COMPONENTES DE TELA

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
        <div>
          <p className="text-xs text-gray-500">Olá,</p>
          <p className="font-semibold text-[#1e3a5f]">{currentUser?.name}</p>
        </div>
        <button onClick={() => setCurrentScreen('profile')} className="p-2 rounded-full bg-gray-100">
          <Settings size={20} />
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
        <button onClick={() => { setShowAddProperty(true); setCurrentScreen('properties'); }}
          className="w-full bg-gradient-to-r from-[#3a7d8f] to-[#2d5f7a] text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2">
          <Plus size={22} /> Solicitar Serviço
        </button>
      </div>
    </div>
  );

  const PropertiesScreen = () => {
    if (showAddProperty) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <div className="bg-white p-4 border-b flex items-center gap-3">
            <button onClick={() => { setShowAddProperty(false); setCurrentScreen('map'); }} className="p-2">
              <ChevronRight className="rotate-180" size={24} />
            </button>
            <h1 className="font-semibold text-lg">Cadastrar Imóvel</h1>
          </div>
          <div className="flex-1 overflow-y-auto p-4 pb-32">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Tipo</label>
                <div className="grid grid-cols-3 gap-3">
                  {[{ value: 'apartment', label: 'Apartamento' }, { value: 'house', label: 'Casa' }, { value: 'townhouse', label: 'Sobrado' }].map(type => (
                    <button key={type.value} onClick={() => setFormData({...formData, type: type.value})}
                      className={`p-4 rounded-xl border-2 ${formData.type === type.value ? 'border-[#3a7d8f] bg-blue-50' : 'border-gray-200'}`}>
                      <Home className="mx-auto mb-2" size={24} />
                      <p className="text-xs font-semibold">{type.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Área (m²)</label>
                <input type="number" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#3a7d8f] outline-none" placeholder="Ex: 120" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold mb-2">Pavimentos</label>
                  <select value={formData.floors} onChange={(e) => setFormData({...formData, floors: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#3a7d8f] outline-none">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Banheiros</label>
                  <select value={formData.bathrooms} onChange={(e) => setFormData({...formData, bathrooms: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#3a7d8f] outline-none">
                    <option value="1">1</option>
                    <option value="2">2 (+R$ 15)</option>
                    <option value="3">3 (+R$ 30)</option>
                    <option value="4">4+ (+R$ 45)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 cursor-pointer">
                  <span className="text-sm font-medium">Tem escadas</span>
                  <input type="checkbox" checked={formData.hasStairs} onChange={(e) => setFormData({...formData, hasStairs: e.target.checked})} className="w-5 h-5" />
                  <span className="text-sm font-bold text-[#3a7d8f]">+R$ 20</span>
                </label>
                <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 cursor-pointer">
                  <span className="text-sm font-medium">Tem quintal</span>
                  <input type="checkbox" checked={formData.hasYard} onChange={(e) => setFormData({...formData, hasYard: e.target.checked})} className="w-5 h-5" />
                  <span className="text-sm font-bold text-[#3a7d8f]">+R$ 30</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Pets</label>
                <select value={formData.pets} onChange={(e) => setFormData({...formData, pets: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#3a7d8f] outline-none">
                  <option value="none">Nenhum</option>
                  <option value="small">Pequeno (+R$ 20)</option>
                  <option value="medium">Médio (+R$ 35)</option>
                  <option value="large">Grande (+R$ 35)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Nível de Sujeira</label>
                <select value={formData.dirtLevel} onChange={(e) => setFormData({...formData, dirtLevel: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#3a7d8f] outline-none">
                  <option value="light">Leve</option>
                  <option value="medium">Médio</option>
                  <option value="heavy">Pesado (+R$ 40)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Endereço</label>
                <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#3a7d8f] outline-none" rows="3" placeholder="Rua, número, bairro" />
              </div>
              {formData.area && (
                <div className="bg-gradient-to-br from-[#1e3a5f] to-[#3a7d8f] rounded-xl p-6 text-white">
                  <p className="text-sm opacity-90">Preço Estimado</p>
                  <p className="text-4xl font-bold">R$ {calculatePrice({...formData, area: parseInt(formData.area)})},00</p>
                </div>
              )}
            </div>
          </div>
          <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t">
            <button onClick={handleAddProperty} disabled={!formData.area || !formData.address}
              className="w-full bg-[#3a7d8f] text-white py-4 rounded-xl font-semibold disabled:opacity-50 shadow-lg">
              Cadastrar Imóvel
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  const RequestServiceScreen = () => {
    const estimatedPrice = calculatePrice(selectedProperty);
    const fees = calculateFees(estimatedPrice);
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white p-4 border-b flex items-center gap-3">
          <button onClick={() => setCurrentScreen('map')} className="p-2">
            <ChevronRight className="rotate-180" size={24} />
          </button>
          <h1 className="font-semibold text-lg">Solicitar Serviço</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pb-32">
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <h3 className="font-semibold mb-3">Imóvel</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Tipo:</span>
                <span className="font-medium">{selectedProperty?.type === 'house' ? 'Casa' : selectedProperty?.type === 'apartment' ? 'Apartamento' : 'Sobrado'}</span>
              </div>
              <div className="flex justify-between">
                <span>Área:</span>
                <span className="font-medium">{selectedProperty?.area}m²</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#1e3a5f] to-[#3a7d8f] rounded-xl p-6 mb-4 text-white shadow-lg">
            <p className="text-sm opacity-90">Preço Estimado</p>
            <p className="text-5xl font-bold mb-4">R$ {estimatedPrice},00</p>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Serviço</span>
                <span>R$ {fees.serviceAmount.toFixed(2)}</span>
              </div>
              <div className="text-xs opacity-80 space-y-1">
                <div className="flex justify-between">
                  <span>• Intermediação (5%)</span>
                  <span>R$ {fees.intermediation}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Proteção (4%)</span>
                  <span>R$ {fees.protection}</span>
                </div>
                <div className="flex justify-between">
                  <span>• Financeira (2%)</span>
                  <span>R$ {fees.financial}</span>
                </div>
              </div>
              <div className="border-t border-white border-opacity-30 pt-2 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>R$ {fees.clientTotal}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Prestadores Disponíveis</h3>
            {nearbyProviders.slice(0, 3).map(provider => (
              <div key={provider.id} className="bg-white rounded-xl p-4 mb-3 shadow-sm flex items-center gap-3">
                <div className="bg-gradient-to-br from-[#3a7d8f] to-[#2d5f7a] rounded-full p-3">
                  <User className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{provider.name}</p>
                  <div className="flex gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Star className="text-yellow-400" size={12} fill="currentColor" />
                      {provider.rating}
                    </span>
                    <span>{provider.completedJobs} serviços</span>
                    <span className="text-[#3a7d8f]">{provider.distance} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t">
          <button onClick={handleRequestService}
            className="w-full bg-gradient-to-r from-[#3a7d8f] to-[#2d5f7a] text-white py-4 rounded-xl font-semibold shadow-lg">
            <Zap className="inline mr-2" size={20} />
            Chamar Prestadores
          </button>
        </div>
      </div>
    );
  };

  const WaitingOffersScreen = () => (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="text-center py-16">
        {offers.length === 0 ? (
          <>
            <div className="relative inline-block mb-6">
              <div className="animate-ping absolute inline-flex h-24 w-24 rounded-full bg-[#3a7d8f] opacity-75"></div>
              <div className="relative inline-flex rounded-full h-24 w-24 bg-gradient-to-br from-[#3a7d8f] to-[#2d5f7a] items-center justify-center shadow-lg">
                <Search className="text-white" size={40} />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Procurando prestadores...</h3>
            <p className="text-gray-600">Notificando {nearbyProviders.length} prestadores</p>
          </>
        ) : (
          <>
            <div className="bg-green-50 rounded-xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="text-green-500" size={28} />
              <div>
                <p className="font-bold text-green-800 text-lg">Propostas Recebidas!</p>
                <p className="text-sm text-green-700">{offers.length} prestadores interessados</p>
              </div>
            </div>
            {offers.map(offer => {
              const offerFees = calculateFees(offer.price);
              return (
                <div key={offer.id} className="bg-white rounded-xl p-5 mb-4 shadow-md">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="bg-gradient-to-br from-[#3a7d8f] to-[#2d5f7a] rounded-full p-3">
                      <User className="text-white" size={28} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-bold text-lg">{offer.provider.name}</p>
                        {offer.provider.verified && <CheckCircle className="text-[#3a7d8f]" size={16} />}
                      </div>
                      <div className="flex gap-3 text-xs text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Star className="text-yellow-400" size={12} fill="currentColor" />
                          {offer.provider.rating}
                        </span>
                        <span>{offer.provider.completedJobs} serviços</span>
                        <span className="text-[#3a7d8f]">{offer.provider.distance} km</span>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm italic">"{offer.message}"</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm">Valor proposto</span>
                        <p className="text-3xl font-bold text-[#3a7d8f]">R$ {offer.price},00</p>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1 bg-white rounded-lg p-3">
                        <div className="flex justify-between">
                          <span>Total com taxas:</span>
                          <span className="font-semibold">R$ {offerFees.clientTotal}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => handleAcceptOffer(offer)}
                        className="bg-green-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                        <Check size={20} /> Aceitar
                      </button>
                      <button className="border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                        <MessageSquare size={20} /> Negociar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );

  const JobActiveScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#3a7d8f] p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Serviço em Andamento</p>
            <p className="font-bold text-lg">#{activeJob?.id.slice(-6)}</p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
            jobStatus === 'confirmed' ? 'bg-yellow-400 text-yellow-900' :
            jobStatus === 'enroute' ?'bg-blue-400 text-blue-900' :
jobStatus === 'in_progress' ? 'bg-green-400 text-green-900' : 'bg-gray-400'
}`}>
{jobStatus === 'confirmed' ? 'Confirmado' :
jobStatus === 'enroute' ? 'A caminho' :
jobStatus === 'in_progress' ? 'Em execução' : 'Aguardando'}
</div>
</div>
</div>
<div className="h-64 bg-gradient-to-br from-green-100 to-blue-100 relative">
<div className="absolute inset-0 flex items-center justify-center">
<MapPin className="text-blue-500" size={48} />
{jobStatus === 'enroute' && (
<div className="absolute animate-bounce">
<Navigation className="text-[#3a7d8f]" size={32} />
</div>
)}
</div>
{jobStatus === 'enroute' && (
<div className="absolute top-4 left-4 right-4 bg-white rounded-xl p-3 shadow-lg">
<div className="flex items-center justify-between">
<span className="text-sm font-medium">Chegada estimada</span>
<span className="text-2xl font-bold text-[#3a7d8f]">12 min</span>
</div>
</div>
)}
</div>
<div className="p-4">
<div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
<div className="flex items-center gap-4 mb-4">
<div className="bg-gradient-to-br from-[#3a7d8f] to-[#2d5f7a] rounded-full p-4">
<User className="text-white" size={32} />
</div>
<div className="flex-1">
<p className="font-semibold text-lg">{activeJob?.provider?.name}</p>
<div className="flex items-center gap-2">
<Star className="text-yellow-400" size={14} fill="currentColor" />
<span className="text-sm">{activeJob?.provider?.rating}</span>
</div>
</div>
{activeJob?.provider?.verified && <CheckCircle className="text-[#3a7d8f]" size={24} />}
</div>
{jobStatus === 'confirmed' && (
<div className="bg-yellow-50 rounded-lg p-3">
<p className="text-sm font-semibold text-yellow-800">Aguardando confirmação</p>
</div>
)}
{jobStatus === 'in_progress' && (
<div className="bg-green-50 rounded-lg p-3">
<div className="flex items-center gap-2 text-green-700">
<CheckCircle size={18} />
<span className="text-sm font-semibold">Serviço iniciado</span>
</div>
</div>
)}
</div>
<div className="space-y-2">
{jobStatus === 'confirmed' && (
<button onClick={() => setJobStatus('enroute')} className="w-full bg-gray-200 py-3 rounded-xl">
[Demo] Prestador a caminho
</button>
)}
{jobStatus === 'enroute' && (
<button onClick={() => setJobStatus('in_progress')} className="w-full bg-gray-200 py-3 rounded-xl">
[Demo] Check-in realizado
</button>
)}
{jobStatus === 'in_progress' && (
<button onClick={() => setCurrentScreen('rating')} className="w-full bg-gray-200 py-3 rounded-xl">
[Demo] Concluir serviço
</button>
)}
</div>
</div>
</div>
);
const RatingScreen = () => (
<div className="min-h-screen bg-gray-50 flex flex-col">
<div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white text-center">
<div className="bg-white bg-opacity-20 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
<CheckCircle size={40} />
</div>
<h2 className="text-2xl font-bold mb-2">Serviço Concluído!</h2>
<p className="text-green-100">Avalie {activeJob?.provider?.name}</p>
</div>
<div className="flex-1 p-4 pb-32">
<div className="bg-white rounded-xl p-6 mb-4">
<p className="text-center text-gray-700 mb-4 font-medium">Como foi o serviço?</p>
<div className="flex justify-center gap-3 mb-6">
{[1, 2, 3, 4, 5].map((star) => (
<button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
<Star size={44} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}
fill={star <= rating ? 'currentColor' : 'none'} />
</button>
))}
</div>
<textarea value={comment} onChange={(e) => setComment(e.target.value)}
placeholder="Deixe um comentário (opcional)"
className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#3a7d8f] outline-none" rows="4" />
</div>
<div className="bg-white rounded-xl p-4 shadow-sm">
<h3 className="font-semibold mb-3">Resumo do Pagamento</h3>
<div className="text-sm space-y-2 mb-4">
<div className="flex justify-between">
<span>Serviço:</span>
<span className="font-medium">R$ {activeJob?.finalPrice?.toFixed(2)}</span>
</div>
<div className="flex justify-between text-xs text-gray-500">
<span>Taxas:</span>
<span>R$ {activeJob?.finalFees?.totalFees}</span>
</div>
<div className="border-t pt-2 flex justify-between font-bold">
<span>Total pago:</span>
<span className="text-[#3a7d8f]">R$ {activeJob?.finalFees?.clientTotal}</span>
</div>
</div>
<div className="bg-green-50 rounded-lg p-3 text-sm text-green-700 flex items-center gap-2">
<CheckCircle size={16} />
Pagamento processado • Liberado ao prestador
</div>
</div>
</div>
<div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t">
<button onClick={() => { setCurrentScreen('map'); setActiveJob(null); setOffers([]); setRating(0); }}
disabled={rating === 0}
className="w-full bg-[#3a7d8f] text-white py-4 rounded-xl font-semibold disabled:opacity-50 shadow-lg">
{rating === 0 ? 'Selecione uma avaliação' : 'Enviar Avaliação'}
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
<p className="text-xs text-gray-600 mb-1">GMV Mês</p>
<p className="text-2xl font-bold">R$ {totalGMV.toLocaleString('pt-BR')}</p>
</div>
<div className="bg-white rounded-xl p-4 shadow-sm">
<p className="text-xs text-gray-600 mb-1">Receita (11%)</p>
<p className="text-2xl font-bold">R$ {platformRevenue.toLocaleString('pt-BR')}</p>
</div>
<div className="bg-white rounded-xl p-4 shadow-sm">
<p className="text-xs text-gray-600 mb-1">Serviços</p>
<p className="text-2xl font-bold">12</p>
</div>
<div className="bg-white rounded-xl p-4 shadow-sm">
<p className="text-xs text-gray-600 mb-1">Royalty Lumio</p>
<p className="text-2xl font-bold text-orange-600">R$ {royaltyLumio.toFixed(2)}</p>
</div>
</div>
<div className="p-4">
<div className="bg-white rounded-xl p-4 shadow-sm">
<h3 className="font-semibold mb-3">Breakdown Financeiro</h3>
<div className="space-y-2 text-sm">
<div className="flex justify-between">
<span>Intermediação (5%):</span>
<span className="font-semibold">R$ {(totalGMV * 0.05).toFixed(2)}</span>
</div>
<div className="flex justify-between">
<span>Proteção (4%):</span>
<span className="font-semibold">R$ {(totalGMV * 0.04).toFixed(2)}</span>
</div>
<div className="flex justify-between">
<span>Financeira (2%):</span>
<span className="font-semibold">R$ {(totalGMV * 0.02).toFixed(2)}</span>
</div>
<div className="border-t pt-2 flex justify-between font-bold">
<span>Total:</span>
<span className="text-[#3a7d8f]">R$ {platformRevenue.toFixed(2)}</span>
</div>
<div className="bg-orange-50 border-l-4 border-orange-400 rounded p-2 text-xs flex justify-between">
<span className="text-orange-800">Royalty Lumio (4%):</span>
<span className="font-bold text-orange-800">R$ {royaltyLumio.toFixed(2)}</span>
</div>
</div>
</div>
</div>
</div>
);
};
return (
<div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
{currentScreen === 'login' && <LoginScreen />}
{currentScreen === 'map' && <MapScreen />}
{currentScreen === 'properties' && <PropertiesScreen />}
{currentScreen === 'request-service' && <RequestServiceScreen />}
{currentScreen === 'waiting-offers' && <WaitingOffersScreen />}
{currentScreen === 'job-active' && <JobActiveScreen />}
{currentScreen === 'rating' && <RatingScreen />}
{currentScreen === 'admin-dashboard' && <AdminDashboard />}
{currentScreen === 'provider-dashboard' && <div className="p-8 text-center"><p>Dashboard Prestador</p></div>}
{currentScreen === 'profile' && <div className="p-8 text-center"><p>Perfil</p></div>}
</div>
);
}
