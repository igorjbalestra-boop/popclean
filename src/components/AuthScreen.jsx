'use client';

import { useState } from 'react';
import { Home, User, Shield, Mail, Lock, Phone, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function AuthScreen({ onSuccess }) {
  const { signIn, signUp, loading } = useAuth();
  const [mode, setMode] = useState('select'); // 'select', 'login', 'register-client', 'register-provider'
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: 'client'
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Preencha todos os campos');
      return;
    }

    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setError('Email ou senha incorretos');
    } else {
      onSuccess?.();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password || !formData.fullName || !formData.phone) {
      setError('Preencha todos os campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const { error } = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      phone: formData.phone,
      role: formData.role
    });

    if (error) {
      if (error.message.includes('already registered')) {
        setError('Este email já está cadastrado');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
    } else {
      // Show success message or redirect
      onSuccess?.();
    }
  };

  // Select Role Screen
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
            <button
              onClick={() => {
                setFormData({ ...formData, role: 'client' });
                setMode('login');
              }}
              className="w-full bg-[#3a7d8f] text-white py-4 rounded-xl font-semibold hover:bg-[#2d5f7a] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <User size={20} />
              Entrar como Cliente
            </button>

            <button
              onClick={() => {
                setFormData({ ...formData, role: 'provider' });
                setMode('login');
              }}
              className="w-full bg-[#1e3a5f] text-white py-4 rounded-xl font-semibold hover:bg-[#2d5f7a] transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Shield size={20} />
              Entrar como Prestador
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

  // Login Screen
  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5f7a] to-[#3a7d8f] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <button
            onClick={() => setMode('select')}
            className="flex items-center gap-2 text-gray-600 mb-6 hover:text-[#3a7d8f]"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>

          <div className="text-center mb-6">
            <div className="mb-4 bg-gradient-to-br from-[#1e3a5f] to-[#3a7d8f] rounded-2xl p-3 inline-block">
              {formData.role === 'client' ? (
                <User className="text-white h-12 w-12" />
              ) : (
                <Shield className="text-white h-12 w-12" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-[#1e3a5f]">
              {formData.role === 'client' ? 'Área do Cliente' : 'Área do Prestador'}
            </h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3a7d8f] outline-none"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3a7d8f] outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3a7d8f] text-white py-4 rounded-xl font-semibold hover:bg-[#2d5f7a] transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Não tem conta?{' '}
              <button
                onClick={() => setMode(formData.role === 'client' ? 'register-client' : 'register-provider')}
                className="text-[#3a7d8f] font-semibold hover:underline"
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Register Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a5f] via-[#2d5f7a] to-[#3a7d8f] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setMode('login')}
          className="flex items-center gap-2 text-gray-600 mb-6 hover:text-[#3a7d8f]"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#1e3a5f]">
            {formData.role === 'client' ? 'Cadastro de Cliente' : 'Cadastro de Prestador'}
          </h2>
          <p className="text-gray-600 text-sm mt-1">Preencha seus dados</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3a7d8f] outline-none"
                placeholder="Seu nome"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3a7d8f] outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3a7d8f] outline-none"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3a7d8f] outline-none"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#3a7d8f] outline-none"
                placeholder="Repita a senha"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3a7d8f] text-white py-4 rounded-xl font-semibold hover:bg-[#2d5f7a] transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Criando conta...
              </>
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Já tem conta?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-[#3a7d8f] font-semibold hover:underline"
            >
              Faça login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
