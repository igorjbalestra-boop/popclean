'use client';

import { useState, useEffect } from 'react';
import { MapPin, Shield, Plus, Settings, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { profiles } from '@/lib/supabase';

export default function ClientDashboard({ onRequestService, onOpenProfile }) {
  const { profile, signOut } = useAuth();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const { data, error } = await profiles.getProviders({ verified: true });
      if (error) throw error;
      setProviders(data || []);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center justify-between border-b-2 border-[#3a7d8f]">
        <div>
          <p className="text-xs text-gray-500">Olá,</p>
          <p className="font-semibold text-[#1e3a5f]">{profile?.full_name || 'Cliente'}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpenProfile}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-red-500"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative bg-gradient-to-br from-green-50 to-blue-50">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#3a7d8f]" size={48} />
          </div>
        ) : (
          <>
            {/* Center marker */}
            <div className="absolute inset-0 flex items-center justify-center">
              <MapPin className="text-[#3a7d8f]" size={48} />
            </div>

            {/* Provider markers */}
            {providers.slice(0, 4).map((provider, idx) => (
              <div
                key={provider.id}
                className="absolute bg-white rounded-full p-3 shadow-lg border-2 border-[#3a7d8f] animate-pulse"
                style={{
                  top: `${20 + idx * 18}%`,
                  left: `${25 + idx * 15}%`
                }}
              >
                <Shield className="text-[#3a7d8f]" size={20} />
              </div>
            ))}

            {/* Provider count card */}
            <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">Prestadores Online</span>
                <span className="text-2xl font-bold text-[#3a7d8f]">
                  {providers.length}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Action Button */}
      <div className="p-6 bg-white border-t shadow-lg">
        <button
          onClick={onRequestService}
          className="w-full bg-gradient-to-r from-[#3a7d8f] to-[#2d5f7a] text-white py-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={22} />
          Solicitar Serviço
        </button>
      </div>
    </div>
  );
}
