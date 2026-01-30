'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, Star, MapPin, Clock, DollarSign, CheckCircle, 
  XCircle, Loader2, LogOut, User, TrendingUp, Calendar,
  Bell, Settings
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { jobs } from '@/lib/supabase';
import { formatCurrency, formatDate, JOB_STATUS_LABELS, PROPERTY_TYPE_LABELS } from '@/lib/constants';

export default function ProviderDashboard({ onOpenProfile }) {
  const { profile, signOut } = useAuth();
  const [availableJobs, setAvailableJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); // 'available', 'my-jobs', 'stats'
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    loadData();
  }, [profile]);

  const loadData = async () => {
    if (!profile) return;
    
    try {
      // Load available jobs
      const { data: available } = await jobs.getAvailable();
      setAvailableJobs(available || []);

      // Load my jobs
      const { data: mine } = await jobs.getByProviderId(profile.id);
      setMyJobs(mine || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (jobId) => {
    try {
      await jobs.assignProvider(jobId, profile.id);
      loadData(); // Refresh
    } catch (error) {
      console.error('Error accepting job:', error);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Calculate stats
  const completedJobs = myJobs.filter(j => ['completed', 'confirmed', 'captured', 'paid_out'].includes(j.status));
  const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.provider_amount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#3a7d8f]" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#3a7d8f] p-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 rounded-full p-2">
              <Shield size={24} />
            </div>
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
          <div className="flex gap-2">
            <button
              onClick={onOpenProfile}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Online toggle */}
        <div className="flex items-center justify-between bg-white bg-opacity-10 rounded-xl p-3">
          <span className="text-sm font-medium">Status</span>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-4 py-1 rounded-full text-sm font-semibold transition-all ${
              isOnline 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-400 text-white'
            }`}
          >
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <TrendingUp className="mx-auto text-green-500 mb-1" size={20} />
          <p className="text-lg font-bold">{formatCurrency(totalEarnings)}</p>
          <p className="text-xs text-gray-500">Ganhos</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <CheckCircle className="mx-auto text-blue-500 mb-1" size={20} />
          <p className="text-lg font-bold">{completedJobs.length}</p>
          <p className="text-xs text-gray-500">Concluídos</p>
        </div>
        <div className="bg-white rounded-xl p-3 shadow-sm text-center">
          <Bell className="mx-auto text-orange-500 mb-1" size={20} />
          <p className="text-lg font-bold">{availableJobs.length}</p>
          <p className="text-xs text-gray-500">Disponíveis</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 flex gap-2">
        <button
          onClick={() => setActiveTab('available')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'available'
              ? 'bg-[#3a7d8f] text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Disponíveis ({availableJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('my-jobs')}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'my-jobs'
              ? 'bg-[#3a7d8f] text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Meus Serviços ({myJobs.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'available' && (
          <div className="space-y-3">
            {availableJobs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <MapPin className="mx-auto mb-3 opacity-50" size={48} />
                <p>Nenhum serviço disponível no momento</p>
                <p className="text-sm">Novos serviços aparecerão aqui</p>
              </div>
            ) : (
              availableJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">
                        {PROPERTY_TYPE_LABELS[job.property?.type] || 'Imóvel'} - {job.property?.area}m²
                      </p>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <MapPin size={14} />
                        <span className="truncate max-w-[200px]">{job.property?.address}</span>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-[#3a7d8f]">
                      {formatCurrency(job.price_gmv || 0)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{job.client?.full_name || 'Cliente'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{formatDate(job.created_at)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcceptJob(job.id)}
                    className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    Aceitar Serviço
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'my-jobs' && (
          <div className="space-y-3">
            {myJobs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="mx-auto mb-3 opacity-50" size={48} />
                <p>Nenhum serviço ainda</p>
                <p className="text-sm">Aceite serviços para começar</p>
              </div>
            ) : (
              myJobs.map((job) => (
                <div key={job.id} className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold">
                        {PROPERTY_TYPE_LABELS[job.property?.type] || 'Imóvel'}
                      </p>
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">
                        {job.property?.address}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      job.status === 'completed' || job.status === 'paid_out'
                        ? 'bg-green-100 text-green-700'
                        : job.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : job.status === 'cancelled'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {JOB_STATUS_LABELS[job.status] || job.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {formatDate(job.created_at)}
                    </span>
                    <span className="font-bold text-[#3a7d8f]">
                      {formatCurrency(job.provider_amount || job.price_gmv || 0)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
