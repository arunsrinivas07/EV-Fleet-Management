import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Car, Plus, ArrowLeft, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { addVehicle } from '../../lib/db';
import { useApp } from '../../context/AppContext';

const MANUFACTURERS = ['BYD', 'Tesla', 'Hyundai', 'Tata', 'MG', 'Kia', 'Audi'];
const DEFAULT_PREVIEWS = {
  BYD: 'https://images.unsplash.com/photo-1706064977464-9b2f6f4c8032?w=400&h=250&fit=crop',
  Tesla: 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=400&h=250&fit=crop',
  Hyundai: 'https://images.unsplash.com/photo-1669074092196-857e4e09f6e6?w=400&h=250&fit=crop',
  Tata: 'https://images.unsplash.com/photo-1593941707882-a56bab827c5e?w=400&h=250&fit=crop',
  MG: 'https://images.unsplash.com/photo-1695662701768-be90234a9e22?w=400&h=250&fit=crop',
  Kia: 'https://images.unsplash.com/photo-1623998021450-85c24c626a5a?w=400&h=250&fit=crop',
  Audi: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=400&h=250&fit=crop',
  Other: 'https://images.unsplash.com/photo-1593941707882-a56bab827c5e?w=400&h=250&fit=crop'
};

export default function AddVehicle() {
  const navigate = useNavigate();
  const { refreshData, vehicleList } = useApp();
  const [form, setForm] = useState({
    id: '',
    manufacturer: 'BYD',
    model: '',
    batteryCapacity: '60 kWh',
    range: 400,
    imageUrl: '',
    status: 'idle',
    location: 'Fleet Depot',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const nextAvailableId = React.useMemo(() => {
    const ids = vehicleList.map(v => {
      const match = v.id.match(/EV-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    const max = ids.length ? Math.max(...ids) : 0;
    return `EV-${String(max + 1).padStart(3, '0')}`;
  }, [vehicleList]);

  // Pre-fill next EV ID on mount
  React.useEffect(() => {
    setForm(prev => ({ ...prev, id: nextAvailableId }));
  }, [nextAvailableId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'range' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSuggestImage = () => {
    const defaultImg = DEFAULT_PREVIEWS[form.manufacturer] || DEFAULT_PREVIEWS.Other;
    setForm(prev => ({ ...prev, imageUrl: defaultImg }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validation: check unique id
    const exists = vehicleList.some(v => v.id.toUpperCase() === form.id.toUpperCase());
    if (exists) {
      setMessage({ type: 'error', text: `Vehicle ID ${form.id} already exists in the fleet database.` });
      setLoading(false);
      return;
    }

    const payload = {
      ...form,
      id: form.id.toUpperCase(),
      imageUrl: form.imageUrl || DEFAULT_PREVIEWS[form.manufacturer] || DEFAULT_PREVIEWS.Other,
    };

    const res = await addVehicle(payload);
    if (res.success) {
      setMessage({ type: 'success', text: `Vehicle ${payload.id} (${payload.manufacturer} ${payload.model}) successfully added to the fleet!` });
      await refreshData();
      // Reset form (except EV id which gets updated automatically)
      setForm({
        id: '',
        manufacturer: 'BYD',
        model: '',
        batteryCapacity: '60 kWh',
        range: 400,
        imageUrl: '',
        status: 'idle',
        location: 'Fleet Depot',
      });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to add vehicle.' });
    }
    setLoading(false);
  };

  const currentPreviewImage = form.imageUrl || DEFAULT_PREVIEWS[form.manufacturer] || DEFAULT_PREVIEWS.Other;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/fleet')}
          className="p-2.5 rounded-2xl bg-white border border-gray-150 hover:bg-gray-50 transition-colors text-gray-500 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Add New Vehicle</h2>
          <p className="text-gray-500 text-sm mt-0.5">Integrate a new electric vehicle into the active fleet</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container */}
        <div className="lg:col-span-2 card bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h3 className="font-bold text-gray-800 text-base flex items-center gap-2 mb-4">
              <span className="w-8 h-8 gradient-green rounded-xl flex items-center justify-center text-white"><Car className="w-4 h-4" /></span>
              Vehicle Specifications
            </h3>

            {/* ID & Manufacturer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Vehicle ID</label>
                <input
                  type="text"
                  name="id"
                  required
                  placeholder="e.g. EV-010"
                  value={form.id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Manufacturer</label>
                <select
                  name="manufacturer"
                  value={form.manufacturer}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all font-semibold cursor-pointer"
                >
                  {MANUFACTURERS.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Model & Battery Capacity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Model Name</label>
                <input
                  type="text"
                  name="model"
                  required
                  placeholder="e.g. Atto 3 / Model Y"
                  value={form.model}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Battery Capacity</label>
                <input
                  type="text"
                  name="batteryCapacity"
                  required
                  placeholder="e.g. 60 kWh"
                  value={form.batteryCapacity}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Range & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Max Range (km)</label>
                <input
                  type="number"
                  name="range"
                  required
                  min="0"
                  placeholder="e.g. 450"
                  value={form.range}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Initial Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all font-semibold cursor-pointer"
                >
                  <option value="idle">Idle (Available)</option>
                  <option value="charging">Charging</option>
                  <option value="workshop">In Workshop</option>
                </select>
              </div>
            </div>

            {/* Location & Image URL */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1.5">Depot Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Fleet Depot / Chicago Center"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide">Image URL (Optional)</label>
                  <button
                    type="button"
                    onClick={handleSuggestImage}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-suggest Stock Image
                  </button>
                </div>
                <input
                  type="url"
                  name="imageUrl"
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white transition-all text-xs"
                />
              </div>
            </div>

            {/* Alert Messages */}
            <AnimatePresence mode="wait">
              {message && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`flex items-start gap-3 p-3.5 rounded-2xl border ${
                    message.type === 'success'
                      ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                      : 'bg-red-50 border-red-100 text-red-800'
                  }`}
                >
                  {message.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="text-xs font-semibold leading-relaxed">{message.text}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit buttons */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-50">
              <button
                type="button"
                onClick={() => navigate('/admin/fleet')}
                className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-2xl text-xs font-bold text-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-100 hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Register Vehicle
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview Column */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide pl-1">Live Card Preview</h3>
          <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-gray-150 p-4 space-y-4">
            <div className="relative h-40 rounded-2xl overflow-hidden bg-gray-50">
              <img
                src={currentPreviewImage}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                {form.status}
              </div>
              <div className="absolute top-2 right-3 w-10 h-10 rounded-full border-2 border-white/20 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                <span className="text-[10px] text-white font-bold">100%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">{form.manufacturer} {form.model || 'Model Name'}</h4>
                  <p className="text-[11px] text-gray-400">{form.id || 'EV-XXX'}</p>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Unassigned
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50 text-[11px]">
                <div className="bg-gray-50 p-2 rounded-xl">
                  <p className="text-gray-400">Location</p>
                  <p className="font-bold text-gray-700 truncate">{form.location}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl">
                  <p className="text-gray-400">Capacity</p>
                  <p className="font-bold text-gray-700">{form.batteryCapacity}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded-xl col-span-2">
                  <p className="text-gray-400">Estimated Range</p>
                  <p className="font-bold text-gray-700">{form.range} km</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
