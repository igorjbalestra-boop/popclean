'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthScreen from '@/components/AuthScreen';
import ClientDashboard from '@/components/ClientDashboard';
import ProviderDashboard from '@/components/ProviderDashboard';
import PropertyForm from '@/components/PropertyForm';
import { Loader2 } from 'lucide-react';

export default function PopcleanApp() {
  const { user, profile, loading, isClient, isProvider, isAdmin } = useAuth();
  const [currentScreen, setCurrentScreen] = useState('dashboard');

  // Reset screen when user changes
  useEffect(() => {
    if (user && profile) {
      setCurrentScreen('dashboard');
    }
  }, [user, profile]);

  // Loading state
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

  // Not authenticated - show auth screen
  if (!user) {
    return <AuthScreen onSuccess={() => setCurrentScreen('dashboard')} />;
  }

  // Waiting for profile to load
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-[#3a7d8f]" size={48} />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Client flow
  if (isClient) {
    if (currentScreen === 'add-property') {
      return (
        <PropertyForm
          onSuccess={(property) => {
            console.log('Property created:', property);
            // TODO: Navigate to request service screen with this property
            setCurrentScreen('dashboard');
          }}
          onCancel={() => setCurrentScreen('dashboard')}
        />
      );
    }

    return (
      <ClientDashboard
        onRequestService={() => setCurrentScreen('add-property')}
        onOpenProfile={() => setCurrentScreen('profile')}
      />
    );
  }

  // Provider flow
  if (isProvider) {
    return (
      <ProviderDashboard
        onOpenProfile={() => setCurrentScreen('profile')}
      />
    );
  }

  // Admin flow (basic placeholder)
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-[#1e3a5f] mb-4">Painel Admin</h1>
        <p className="text-gray-600">Em desenvolvimento...</p>
      </div>
    );
  }

  // Fallback
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-600">Perfil não reconhecido</p>
    </div>
  );
}
