"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Edit2, Trash2, X, Crown, Check,
  Calendar, UserPlus, Shield,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const DEFAULT_MEMBERS = [
  {
    id: 1,
    name: "Shahzad khan",
    age: 45,
    relationship: "Self",
    avatar: "https://ui-avatars.com/api/?name=Shahzad+Khan&background=003049&color=fff&size=200",
    healthPlan: "Active",
  },
];

const familyHealthPlan = {
  name: "Premium Family Plan",
  price: "₹2,999/month",
  features: [
    "Covers up to 5 members",
    "24x7 Teleconsultation",
    "Free Annual Health Checkup",
    "Discounts on Lab Tests",
    "Priority Appointment Booking",
  ],
  renewalDate: "December 1, 2025",
  isActive: true,
};

const STORAGE_KEY = "swasthai_family_members";

export default function FamilyWallet() {
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", age: "", relationship: "Spouse" });

  const maxMembers = 5;

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setFamilyMembers(JSON.parse(saved));
      } else {
        setFamilyMembers(DEFAULT_MEMBERS);
      }
    } catch {
      setFamilyMembers(DEFAULT_MEMBERS);
    }
    setLoaded(true);
  }, []);

  // Save to localStorage whenever members change
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(familyMembers));
    }
  }, [familyMembers, loaded]);

  const progress = (familyMembers.length / maxMembers) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setFormData({ name: "", age: "", relationship: "Spouse" });
    setShowModal(true);
  };

  const handleEditMember = (member: any) => {
    setEditingMember(member.id);
    setFormData({ name: member.name, age: member.age.toString(), relationship: member.relationship });
    setShowModal(true);
  };

  const handleSaveMember = () => {
    if (!formData.name.trim() || !formData.age) {
      alert("Please fill in all required fields");
      return;
    }

    const bgColors = ["003049", "669bbc", "c1121f", "2d6a4f", "7b2d8b"];

    if (editingMember !== null) {
      setFamilyMembers(prev =>
        prev.map(m =>
          m.id === editingMember
            ? {
                ...m,
                name: formData.name,
                age: parseInt(formData.age),
                relationship: formData.relationship,
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=${bgColors[1]}&color=fff&size=200`,
              }
            : m
        )
      );
    } else {
      if (familyMembers.length >= maxMembers) {
        alert(`Maximum ${maxMembers} family members allowed`);
        return;
      }
      const colorIndex = familyMembers.length % bgColors.length;
      const newMember = {
        id: Date.now(),
        name: formData.name,
        age: parseInt(formData.age),
        relationship: formData.relationship,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=${bgColors[colorIndex]}&color=fff&size=200`,
        healthPlan: "Not Subscribed",
      };
      setFamilyMembers(prev => [...prev, newMember]);
    }

    setShowModal(false);
    setFormData({ name: "", age: "", relationship: "Spouse" });
  };

  const handleRemoveMember = (id: number) => {
    if (confirm("Are you sure you want to remove this family member?")) {
      setFamilyMembers(prev => prev.filter(m => m.id !== id));
    }
  };

  if (!loaded) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-white border-2 border-gray-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="h-6 w-6 text-gray-900" />
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-900">👨‍👩‍👧‍👦 Family Wallet</CardTitle>
              <CardDescription className="text-gray-700">
                Manage your family members and health subscriptions easily
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900">
                Family Members Added: {familyMembers.length}/{maxMembers}
              </span>
              <span className="text-gray-700">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {familyMembers.map((member, index) => (
          <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
            <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300 border-2 border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative">
                    <img src={member.avatar} alt={member.name} className="w-16 h-16 rounded-full ring-2 ring-gray-300" />
                    {member.relationship === "Self" && (
                      <div className="absolute -top-1 -right-1 bg-gray-900 rounded-full p-1">
                        <Crown className="h-3 w-3 text-yellow-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.relationship} • {member.age} years</p>
                  </div>
                </div>

                <div className="mb-4">
                  <Badge
                    variant={member.healthPlan === "Active" ? "default" : "secondary"}
                    className={member.healthPlan === "Active" ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-gray-100 text-gray-700"}
                  >
                    {member.healthPlan === "Active" ? <Check className="h-3 w-3 mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
                    {member.healthPlan}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditMember(member)}
                    className="flex-1 bg-gray-800 text-white border-gray-700 hover:bg-gray-700">
                    <Edit2 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  {member.relationship !== "Self" && (
                    <Button variant="outline" size="sm" onClick={() => handleRemoveMember(member.id)}
                      className="flex-1 bg-gray-800 text-white border-gray-700 hover:bg-red-600 hover:border-red-600">
                      <Trash2 className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {familyMembers.length < maxMembers && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="h-full border-2 border-dashed border-gray-300 hover:border-gray-500 hover:bg-gray-50 transition-all duration-300 cursor-pointer bg-white" onClick={handleAddMember}>
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px] p-6">
                <div className="p-4 bg-gray-200 rounded-full mb-4">
                  <Plus className="h-8 w-8 text-gray-900" />
                </div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">Add Family Member</h3>
                <p className="text-sm text-gray-700 text-center">Click to add a new family member</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Health Plan */}
      <Card className="border-2 border-gray-200 bg-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg shadow-sm">
                <Shield className="h-6 w-6 text-gray-900" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">{familyHealthPlan.name}</CardTitle>
                <CardDescription className="text-gray-700">Comprehensive coverage for your entire family</CardDescription>
              </div>
            </div>
            {familyHealthPlan.isActive && (
              <Badge className="bg-green-500 hover:bg-green-600">
                <Check className="h-3 w-3 mr-1" /> Active
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 mb-3">Plan Features:</h4>
              {familyHealthPlan.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="p-1 bg-green-100 rounded-full">
                    <Check className="h-3 w-3 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-800">{feature}</span>
                </div>
              ))}
            </div>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-700">Plan Price</span>
                  <span className="text-2xl font-bold text-gray-900">{familyHealthPlan.price}</span>
                </div>
                {familyHealthPlan.isActive && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Calendar className="h-4 w-4" />
                    <span>Renews on {familyHealthPlan.renewalDate}</span>
                  </div>
                )}
              </div>
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white" size="lg">
                {familyHealthPlan.isActive ? "Manage Subscription" : "Subscribe Now"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              onClick={e => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <UserPlus className="h-5 w-5 text-gray-900" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {editingMember !== null ? "Edit Family Member" : "Add Family Member"}
                    </h3>
                  </div>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                      placeholder="Enter full name"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Age <span className="text-red-500">*</span></label>
                    <input type="number" name="age" value={formData.age} onChange={handleInputChange}
                      placeholder="Enter age" min="0" max="120"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Relationship</label>
                    <select name="relationship" value={formData.relationship} onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 outline-none bg-white text-gray-900">
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Grandfather">Grandfather</option>
                      <option value="Grandmother">Grandmother</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1 border-2 border-gray-300 text-gray-900 hover:bg-gray-100">Cancel</Button>
                  <Button onClick={handleSaveMember} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white">
                    {editingMember !== null ? "Update" : "Save"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}