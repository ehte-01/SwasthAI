'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { 
  Save, User, Phone, Calendar, MapPin, Mail, Droplets, 
  Shield, Trash2, CheckCircle, AlertCircle, Home, Cloud, CloudOff
} from 'lucide-react';
import FamilyWallet from '@/components/family-wallet';
import Navbar from '@/components/navbar';

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergency_contact: string;
  medical_conditions: string;
  allergies: string;
  medications: string;
}

const EMPTY_PROFILE: ProfileData = {
  full_name: '', email: '', phone: '', date_of_birth: '',
  gender: '', blood_group: '', address: '', city: '',
  state: '', pincode: '', emergency_contact: '',
  medical_conditions: '', allergies: '', medications: ''
};

export default function SimpleProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });

  const showMsg = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: null, text: '' }), 3000);
  };

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);

          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (data && !error) {
            setProfile({
              full_name: data.full_name || '',
              email: data.email || user.email || '',
              phone: data.phone || '',
              date_of_birth: data.date_of_birth || '',
              gender: data.gender || '',
              blood_group: data.blood_group || '',
              address: data.address || '',
              city: data.city || '',
              state: data.state || '',
              pincode: data.pincode || '',
              emergency_contact: data.emergency_contact || '',
              medical_conditions: data.medical_conditions || '',
              allergies: data.allergies || '',
              medications: data.medications || '',
            });
            setIsSynced(true);
            localStorage.setItem('simple_profile', JSON.stringify(data));
            setIsLoading(false);
            return;
          }

          const saved = localStorage.getItem('simple_profile');
          if (saved) {
            setProfile(JSON.parse(saved));
          } else if (user.email) {
            setProfile(prev => ({ ...prev, email: user.email! }));
          }
        } else {
          const saved = localStorage.getItem('simple_profile');
          if (saved) setProfile(JSON.parse(saved));
        }
      } catch {
        const saved = localStorage.getItem('simple_profile');
        if (saved) {
          try { setProfile(JSON.parse(saved)); } catch {}
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setIsSynced(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      localStorage.setItem('simple_profile', JSON.stringify(profile));

      if (userId) {
        const { error } = await supabase
          .from('user_profiles')
          .upsert({ user_id: userId, ...profile, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

        if (error) throw error;
        setIsSynced(true);
        showMsg('success', '✅ Profile saved & synced to cloud!');
      } else {
        await new Promise(r => setTimeout(r, 600));
        showMsg('success', '💾 Saved locally. Login to sync to cloud.');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      showMsg('error', 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const clearProfile = async () => {
    if (!confirm('Are you sure you want to clear all profile data?')) return;
    setProfile(EMPTY_PROFILE);
    localStorage.removeItem('simple_profile');
    setIsSynced(false);
    if (userId) {
      await supabase.from('user_profiles').delete().eq('user_id', userId);
    }
    showMsg('success', 'Profile cleared successfully!');
  };

  const getCompleteness = () => {
    const req = ['full_name', 'email', 'phone', 'date_of_birth', 'gender', 'blood_group'];
    return Math.round((req.filter(f => profile[f as keyof ProfileData].trim()).length / req.length) * 100);
  };
  const completeness = getCompleteness();

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading your profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-slate-100">

        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Health Profile</h1>
                  <p className="text-sm text-gray-600">Manage your health information</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Sync badge */}
                <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  userId
                    ? isSynced ? 'bg-green-50 text-green-700 border border-green-200'
                               : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}>
                  {userId
                    ? isSynced
                      ? <><Cloud className="h-3.5 w-3.5" /> Synced to Cloud</>
                      : <><CloudOff className="h-3.5 w-3.5" /> Unsaved changes</>
                    : <><CloudOff className="h-3.5 w-3.5" /> Local only · Login to sync</>}
                </div>

                {/* Progress circle */}
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-medium">Completion</p>
                    <p className="text-lg font-bold text-gray-900">{completeness}%</p>
                  </div>
                  <div className="relative h-16 w-16">
                    <svg className="transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                      <circle cx="18" cy="18" r="16" fill="none" stroke="url(#gradient)"
                        strokeWidth="3" strokeDasharray={`${completeness}, 100`} strokeLinecap="round" />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#374151" />
                          <stop offset="100%" stopColor="#1f2937" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-gray-900" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Message */}
          <AnimatePresence>
            {message.type && (
              <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }} transition={{ type: 'spring', duration: 0.5 }} className="mb-6">
                <div className={`rounded-xl p-4 shadow-lg border-2 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center space-x-3">
                    {message.type === 'success'
                      ? <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                      : <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />}
                    <p className={`font-medium ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{message.text}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">

                {/* Personal Info */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-md border border-gray-100">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3"><User className="h-5 w-5 text-gray-700" /></div>
                      Personal Information
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {[
                        { label: 'Full Name', field: 'full_name', type: 'text', icon: <User className="h-5 w-5 text-gray-400" />, placeholder: 'John Doe', required: true },
                        { label: 'Email Address', field: 'email', type: 'email', icon: <Mail className="h-5 w-5 text-gray-400" />, placeholder: 'john@example.com', required: true },
                        { label: 'Phone Number', field: 'phone', type: 'tel', icon: <Phone className="h-5 w-5 text-gray-400" />, placeholder: '+91 98765 43210', required: true },
                        { label: 'Date of Birth', field: 'date_of_birth', type: 'date', icon: <Calendar className="h-5 w-5 text-gray-400" />, placeholder: '', required: true },
                      ].map(({ label, field, type, icon, placeholder, required }) => (
                        <div key={field}>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {label} {required && <span className="text-red-500">*</span>}
                          </label>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>
                            <input type={type} value={profile[field as keyof ProfileData]}
                              onChange={e => handleInputChange(field as keyof ProfileData, e.target.value)}
                              className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all outline-none"
                              placeholder={placeholder} />
                          </div>
                        </div>
                      ))}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Gender <span className="text-red-500">*</span></label>
                        <select value={profile.gender} onChange={e => handleInputChange('gender', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all outline-none bg-white">
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                          <option value="prefer_not_to_say">Prefer not to say</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                          <select value={profile.blood_group} onChange={e => handleInputChange('blood_group', e.target.value)}
                            className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all outline-none bg-white">
                            <option value="">Select blood group</option>
                            {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Address */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-md border border-gray-100">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3"><MapPin className="h-5 w-5 text-gray-700" /></div>
                      Address Information
                    </h2>
                  </div>
                  <div className="p-6 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address</label>
                      <div className="relative">
                        <Home className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <textarea value={profile.address} onChange={e => handleInputChange('address', e.target.value)}
                          rows={3} className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all outline-none resize-none"
                          placeholder="123 Main Street" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {[
                        { label: 'City', field: 'city', placeholder: 'Delhi' },
                        { label: 'State', field: 'state', placeholder: 'Uttar Pradesh' },
                        { label: 'PIN Code', field: 'pincode', placeholder: '201301' },
                      ].map(({ label, field, placeholder }) => (
                        <div key={field}>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                          <input type="text" value={profile[field as keyof ProfileData]}
                            onChange={e => handleInputChange(field as keyof ProfileData, e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all outline-none"
                            placeholder={placeholder} />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Medical Info */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl shadow-md border border-gray-100">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3"><Droplets className="h-5 w-5 text-gray-700" /></div>
                      Medical Information
                    </h2>
                  </div>
                  <div className="p-6 space-y-5">
                    {[
                      { label: 'Medical Conditions', field: 'medical_conditions', rows: 3, placeholder: 'e.g., Diabetes, Hypertension' },
                      { label: 'Allergies', field: 'allergies', rows: 2, placeholder: 'e.g., Penicillin, Peanuts' },
                      { label: 'Current Medications', field: 'medications', rows: 3, placeholder: 'List medications with dosages' },
                    ].map(({ label, field, rows, placeholder }) => (
                      <div key={field}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                        <textarea value={profile[field as keyof ProfileData]}
                          onChange={e => handleInputChange(field as keyof ProfileData, e.target.value)}
                          rows={rows} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all outline-none resize-none"
                          placeholder={placeholder} />
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-1 space-y-6">

                {/* Emergency Contact */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 sticky top-24">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3"><Shield className="h-5 w-5 text-gray-700" /></div>
                      Emergency Contact
                    </h2>
                  </div>
                  <div className="p-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Emergency Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input type="tel" value={profile.emergency_contact} onChange={e => handleInputChange('emergency_contact', e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all outline-none"
                        placeholder="+91 70071 73108" />
                    </div>
                  </div>
                </motion.div>

                {/* Buttons */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
                  <button type="submit" disabled={isSaving}
                    className="w-full px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2">
                    {isSaving
                      ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Saving...</span></>
                      : <><Save className="h-5 w-5" /><span>Save Profile</span></>}
                  </button>
                  <button type="button" onClick={clearProfile}
                    className="w-full px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 flex items-center justify-center space-x-2">
                    <Trash2 className="h-5 w-5" /><span>Clear Profile</span>
                  </button>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1.5">
                      {userId
                        ? <><Cloud className="h-3.5 w-3.5 text-green-500" /> Synced to Supabase</>
                        : <><CloudOff className="h-3.5 w-3.5" /> Login to enable cloud sync</>}
                    </p>
                  </div>
                </motion.div>

                {/* Quick Summary */}
                {completeness > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-2xl shadow-md border border-gray-200 p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                      <CheckCircle className="h-5 w-5 text-gray-700 mr-2" />Quick Summary
                    </h3>
                    <div className="space-y-3">
                      {profile.full_name && <div className="flex items-center space-x-2 text-sm"><User className="h-4 w-4 text-gray-700 flex-shrink-0" /><span className="text-gray-700 truncate">{profile.full_name}</span></div>}
                      {profile.blood_group && <div className="flex items-center space-x-2 text-sm"><Droplets className="h-4 w-4 text-gray-700 flex-shrink-0" /><span className="text-gray-700">{profile.blood_group}</span></div>}
                      {profile.phone && <div className="flex items-center space-x-2 text-sm"><Phone className="h-4 w-4 text-gray-700 flex-shrink-0" /><span className="text-gray-700 truncate">{profile.phone}</span></div>}
                      {(profile.city || profile.state) && (
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-700 flex-shrink-0" />
                          <span className="text-gray-700 truncate">{[profile.city, profile.state].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </form>

          {/* Family Wallet */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
            <FamilyWallet />
          </motion.div>
        </div>
      </div>
    </>
  );
}