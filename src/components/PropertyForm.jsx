'use client';

import { useState } from 'react';
import { Home, ChevronRight, Loader2 } from 'lucide-react';
import { properties } from '@/lib/supabase';
import { calculatePrice, PROPERTY_TYPE_LABELS, PET_OPTIONS, DIRT_LEVELS, formatCurrency } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth';

export default function PropertyForm({ onSuccess, onCancel }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    type: 'house',
    area: '',
    floors: 1,
    bathrooms: 1,
    has_stairs: false,
    has_yard: false,
    pets: 'none',
    dirt_level: 'medium',
    service_type: 'regular',
    address: '',
    notes: ''
  });

  const handleSubmit = async () => {
    if (!formData.area || !formData.address) {
      setError('Preencha a área e o endereço');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const propertyData = {
        owner_id: user.id,
        type: formData.type,
        area: parseInt(formData.area),
        floors: formData.floors,
        bathrooms: formData.bathrooms,
        has_stairs: formData.has_stairs,
        has_yard: formData.has_yard,
        pets: formData.pets,
        dirt_level: formData.dirt_level,
        address: formData.address,
        notes: formData.notes
      };

      const { data, error: dbError } = await properties.create(propertyData);

      if (dbError) throw dbError;

      onSuccess?.(data);
    } catch (err) {
      console.error('Error creating property:', err);
      setError('Erro ao cadastrar imóvel. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const estimatedPrice = formData.area ? calculatePrice({
    ...formData,
    area: parseInt(formData.area)
  }) : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 border-b flex items-center gap-3 sticky top-0 z-10">
        <button onClick={onCancel} className="p-2">
          <ChevronRight className="rotate-180" size={24} />
        </button>
        <h1 className="font-semibold text-lg">Cadastrar Imóvel</h1>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <div className="space-y-4">
          {/* Property Type */}
          <div>
            <label className="block text-sm font-semibold mb-2">Tipo</label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: value })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.type === value
                      ? 'border-[#3a7d8f] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Home className="mx-auto mb-2" size={24} />
                  <p className="text-xs font-semibold">{label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Area */}
          <div>
            <label className="block text-sm font-semibold mb-2">Área (m²)</label>
            <input
              type="number"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#3a7d8f] outline-none"
              placeholder="Ex: 120"
            />
          </div>

          {/* Floors and Bathrooms */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold mb-2">Pavimentos</label>
              <select
                value={formData.floors}
                onChange={(e) => setFormData({ ...formData, floors: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#3a7d8f] outline-none"
              >
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Banheiros</label>
              <select
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#3a7d8f] outline-none"
              >
                <option value="1">1</option>
                <option value="2">2 (+R$ 15)</option>
                <option value="3">3 (+R$ 30)</option>
                <option value="4">4+ (+R$ 45)</option>
              </select>
            </div>
          </div>

          {/* Extras checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:bg-gray-50">
              <span className="text-sm font-medium">Tem escadas</span>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.has_stairs}
                  onChange={(e) => setFormData({ ...formData, has_stairs: e.target.checked })}
                  className="w-5 h-5 accent-[#3a7d8f]"
                />
                <span className="text-sm font-bold text-[#3a7d8f]">+R$ 20</span>
              </div>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-200 cursor-pointer hover:bg-gray-50">
              <span className="text-sm font-medium">Tem quintal</span>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.has_yard}
                  onChange={(e) => setFormData({ ...formData, has_yard: e.target.checked })}
                  className="w-5 h-5 accent-[#3a7d8f]"
                />
                <span className="text-sm font-bold text-[#3a7d8f]">+R$ 30</span>
              </div>
            </label>
          </div>

          {/* Pets */}
          <div>
            <label className="block text-sm font-semibold mb-2">Pets</label>
            <select
              value={formData.pets}
              onChange={(e) => setFormData({ ...formData, pets: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#3a7d8f] outline-none"
            >
              {PET_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.price > 0 && `(+R$ ${option.price})`}
                </option>
              ))}
            </select>
          </div>

          {/* Dirt Level */}
          <div>
            <label className="block text-sm font-semibold mb-2">Nível de Sujeira</label>
            <select
              value={formData.dirt_level}
              onChange={(e) => setFormData({ ...formData, dirt_level: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#3a7d8f] outline-none"
            >
              {DIRT_LEVELS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} {option.price > 0 && `(+R$ ${option.price})`}
                </option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold mb-2">Endereço</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#3a7d8f] outline-none resize-none"
              rows="3"
              placeholder="Rua, número, bairro, cidade"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2">Observações (opcional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-[#3a7d8f] outline-none resize-none"
              rows="2"
              placeholder="Informações adicionais..."
            />
          </div>

          {/* Price Preview */}
          {formData.area && (
            <div className="bg-gradient-to-br from-[#1e3a5f] to-[#3a7d8f] rounded-xl p-6 text-white">
              <p className="text-sm opacity-90">Preço Estimado</p>
              <p className="text-4xl font-bold">{formatCurrency(estimatedPrice)}</p>
              <p className="text-xs opacity-75 mt-2">
                + taxas da plataforma (11%)
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t">
        <button
          onClick={handleSubmit}
          disabled={!formData.area || !formData.address || loading}
          className="w-full bg-[#3a7d8f] text-white py-4 rounded-xl font-semibold disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Salvando...
            </>
          ) : (
            'Cadastrar Imóvel'
          )}
        </button>
      </div>
    </div>
  );
}
