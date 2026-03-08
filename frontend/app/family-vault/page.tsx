'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { familyOperations, vaultOperations, emergencyContactOperations } from '@/lib/database-utils';
import { StorageService, ALLOWED_DOCUMENT_TYPES, MAX_FILE_SIZES } from '@/lib/storage';
import { FamilyMember, VaultDocument, EmergencyContact } from '@/lib/database.types';
import {
  Users,
  UserPlus,
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  Phone,
  AlertTriangle,
  Calendar,
  Droplets,
  Plus,
  Folder,
  Image as ImageIcon,
  FileIcon,
  Loader2,
  X,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/protected-route';
import DatabaseStatus from '@/components/database-status';

export default function FamilyVault() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState('family');
  const [isLoading, setIsLoading] = useState(true);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [documents, setDocuments] = useState<VaultDocument[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data: familyData, error: familyError } = await familyOperations.getFamilyMembers(user.id);
      if (familyError) console.error('Error loading family members:', familyError);
      else setFamilyMembers(familyData || []);

      try {
        const { data: documentsData, error: documentsError } = await vaultOperations.getVaultDocuments(user.id);
        if (documentsError) {
          console.error('Error loading documents:', documentsError);
          if (documentsError.message?.includes('vault_documents'))
            toast.error('Database setup required. Please check DATABASE-SETUP.md');
        } else setDocuments(documentsData || []);
      } catch (error) {
        console.error('Failed to load documents:', error);
        setDocuments([]);
      }

      try {
        const { data: contactsData, error: contactsError } = await emergencyContactOperations.getEmergencyContacts(user.id);
        if (contactsError) {
          console.error('Error loading emergency contacts:', contactsError);
          if (contactsError.message?.includes('emergency_contacts'))
            toast.error('Database setup required. Please check DATABASE-SETUP.md');
        } else setEmergencyContacts(contactsData || []);
      } catch (error) {
        console.error('Failed to load emergency contacts:', error);
        setEmergencyContacts([]);
      }
    } catch (error) {
      console.error('Error loading vault data:', error);
      toast.error('Failed to load vault data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const validation = StorageService.validateFile(file, {
      maxSize: MAX_FILE_SIZES.DOCUMENT,
      allowedTypes: ALLOWED_DOCUMENT_TYPES,
    });
    if (!validation.valid) { toast.error(validation.error); return; }
    if (!selectedDocumentType) { toast.error('Please select a document type'); return; }

    setIsUploading(true);
    try {
      const uploadResult = await StorageService.uploadDocument(file, user.id, selectedDocumentType);
      if (uploadResult.error) throw new Error(uploadResult.error);

      const { data, error } = await vaultOperations.addVaultDocument({
        user_id: user.id,
        document_type: selectedDocumentType,
        title: file.name,
        file_url: uploadResult.url,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        is_encrypted: false,
      });
      if (error) throw error;

      setDocuments(prev => [...prev, data!]);
      toast.success('Document uploaded successfully!');
      setSelectedDocumentType('');
    } catch (error: any) {
      toast.error('Failed to upload document: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to delete this family member?')) return;
    try {
      const { error } = await familyOperations.deleteFamilyMember(memberId);
      if (error) throw error;
      setFamilyMembers(prev => prev.filter(m => m.id !== memberId));
      toast.success('Family member deleted');
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const { error } = await vaultOperations.deleteVaultDocument(documentId);
      if (error) throw error;
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success('Document deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete document: ' + error.message);
    }
  };

  const getRelationLabel = (relation: string) => {
    const labels: Record<string, string> = {
      spouse: 'Spouse', child: 'Child', parent: 'Parent',
      sibling: 'Sibling', grandparent: 'Grandparent',
      grandchild: 'Grandchild', other: 'Family Member'
    };
    return labels[relation] || 'Family Member';
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return 'Unknown';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />;
    if (mimeType === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <DatabaseStatus />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Family Vault</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your family members, health documents, and emergency contacts securely.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-500">Loading vault data...</span>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="family" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Family Members
                {familyMembers.length > 0 && <Badge variant="secondary" className="ml-1">{familyMembers.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                Documents
                {documents.length > 0 && <Badge variant="secondary" className="ml-1">{documents.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Emergency Contacts
                {emergencyContacts.length > 0 && <Badge variant="secondary" className="ml-1">{emergencyContacts.length}</Badge>}
              </TabsTrigger>
            </TabsList>

            {/* FAMILY MEMBERS TAB */}
            <TabsContent value="family">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Family Members</h2>
                <Button onClick={() => router.push('/family-vault/add-member')} className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" /> Add Member
                </Button>
              </div>

              {familyMembers.length === 0 ? (
                <Card className="text-center py-16">
                  <CardContent>
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No family members yet</h3>
                    <p className="text-gray-400 dark:text-gray-500 mt-1 mb-4">Add your family members to manage their health records.</p>
                    <Button onClick={() => router.push('/family-vault/add-member')}>
                      <UserPlus className="h-4 w-4 mr-2" /> Add First Member
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {familyMembers.map((member) => (
                    <Card key={member.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar_url || ''} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {member.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{member.name}</CardTitle>
                            <Badge variant="outline" className="text-xs mt-1">{getRelationLabel(member.relationship)}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2 space-y-1">
                        {member.date_of_birth && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>Age: {calculateAge(member.date_of_birth)}</span>
                          </div>
                        )}
                        {member.blood_group && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Droplets className="h-3.5 w-3.5 text-red-400" />
                            <span>Blood: {member.blood_group}</span>
                          </div>
                        )}
                        {member.allergies && member.allergies.length > 0 && (
                          <div className="flex items-start gap-2 text-sm text-gray-500">
                            <AlertTriangle className="h-3.5 w-3.5 text-yellow-400 mt-0.5" />
                            <span className="line-clamp-1">Allergies: {member.allergies.join(', ')}</span>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="pt-2 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedMember(member)}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1"
                          onClick={() => router.push(`/family-vault/add-member?edit=${member.id}`)}>
                          <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>
                        <Button variant="outline" size="sm"
                          className="text-red-400 hover:text-red-600 hover:border-red-400"
                          onClick={() => handleDeleteMember(member.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* DOCUMENTS TAB */}
            <TabsContent value="documents">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Health Documents</h2>
                <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="flex items-center gap-2">
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload Document
                </Button>
              </div>

              <Card className="mb-6 p-4">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                  <div className="flex-1">
                    <Label className="mb-1 block text-sm">Document Type</Label>
                    <Select value={selectedDocumentType} onValueChange={setSelectedDocumentType}>
                      <SelectTrigger><SelectValue placeholder="Select document type..." /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="lab_report">Lab Report</SelectItem>
                        <SelectItem value="scan">Scan / X-Ray / MRI</SelectItem>
                        <SelectItem value="vaccination">Vaccination Record</SelectItem>
                        <SelectItem value="insurance">Insurance Document</SelectItem>
                        <SelectItem value="discharge_summary">Discharge Summary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading || !selectedDocumentType} variant="secondary">
                    <Plus className="h-4 w-4 mr-1" /> Choose File
                  </Button>
                  <input ref={fileInputRef} type="file" className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={handleFileUpload} />
                </div>
              </Card>

              {documents.length === 0 ? (
                <Card className="text-center py-16">
                  <CardContent>
                    <Folder className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No documents yet</h3>
                    <p className="text-gray-400 dark:text-gray-500 mt-1">Upload prescriptions, lab reports, and other health documents.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <Card key={doc.id} className="hover:shadow-sm transition-shadow">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                              {getFileIcon(doc.mime_type)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{doc.title}</p>
                              <p className="text-xs text-gray-400">
                                {doc.document_type.replace('_', ' ')} · {formatFileSize(doc.file_size)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button variant="ghost" size="icon" onClick={() => window.open(doc.file_url, '_blank')} title="Download">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600"
                              onClick={() => handleDeleteDocument(doc.id)} title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* EMERGENCY CONTACTS TAB */}
            <TabsContent value="emergency">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Emergency Contacts</h2>
                <Button onClick={() => router.push('/family-vault/add-contact')} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Contact
                </Button>
              </div>

              {emergencyContacts.length === 0 ? (
                <Card className="text-center py-16">
                  <CardContent>
                    <Phone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">No emergency contacts yet</h3>
                    <p className="text-gray-400 dark:text-gray-500 mt-1 mb-4">Add contacts who should be notified in case of emergencies.</p>
                    <Button onClick={() => router.push('/family-vault/add-contact')}>
                      <Plus className="h-4 w-4 mr-2" /> Add First Contact
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {emergencyContacts.map((contact) => (
                    <Card key={contact.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="py-4 px-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full text-red-500">
                              <Phone className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold">{contact.name}</p>
                              <p className="text-sm text-gray-500">{contact.relationship}</p>
                              <p className="text-sm text-blue-500 mt-0.5">{contact.phone}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon"
                            onClick={() => router.push(`/family-vault/add-contact?edit=${contact.id}`)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* VIEW MEMBER MODAL */}
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedMember(null)}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 relative"
              onClick={(e) => e.stopPropagation()}>
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={() => setSelectedMember(null)}>
                <X className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedMember.avatar_url || ''} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                    {selectedMember.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{selectedMember.name}</h2>
                  <Badge variant="outline">{getRelationLabel(selectedMember.relationship)}</Badge>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                {selectedMember.date_of_birth && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date of Birth</span>
                      <span className="font-medium">{new Date(selectedMember.date_of_birth).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Age</span>
                      <span className="font-medium">{calculateAge(selectedMember.date_of_birth)} years</span>
                    </div>
                  </>
                )}
                {selectedMember.blood_group && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Blood Group</span>
                    <span className="font-medium text-red-500">{selectedMember.blood_group}</span>
                  </div>
                )}
                {selectedMember.gender && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gender</span>
                    <span className="font-medium capitalize">{selectedMember.gender}</span>
                  </div>
                )}
                {selectedMember.allergies && selectedMember.allergies.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Allergies</span>
                    <span className="font-medium text-right max-w-[60%]">{selectedMember.allergies.join(', ')}</span>
                  </div>
                )}
                {selectedMember.medical_conditions && selectedMember.medical_conditions.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Conditions</span>
                    <span className="font-medium text-right max-w-[60%]">{selectedMember.medical_conditions.join(', ')}</span>
                  </div>
                )}
                {selectedMember.medications && selectedMember.medications.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Medications</span>
                    <span className="font-medium text-right max-w-[60%]">{selectedMember.medications.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <Button className="flex-1" onClick={() => {
                  setSelectedMember(null);
                  router.push(`/family-vault/add-member?edit=${selectedMember.id}`);
                }}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Member
                </Button>
                <Button variant="outline" onClick={() => setSelectedMember(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}