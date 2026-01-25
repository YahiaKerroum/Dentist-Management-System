import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../services/user.service';
import { User, UpdateUserDTO } from '../types/user';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { 
    Camera, 
    Edit2, 
    Award, 
    Phone, 
    Mail, 
    MapPin, 
    Calendar, 
    Clock,
    TrendingUp,
    Users
} from 'lucide-react';

interface ProfilePageProps {
    token: string;
}

export function ProfilePage({ token }: ProfilePageProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateUserDTO>({});
    const [workingHours, setWorkingHours] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProfile();
    }, [token]);

    const fetchProfile = async () => {
        try {
            const response = await getUserProfile(token);
            setUser(response.data);
            setFormData({
                firstName: response.data.firstName,
                lastName: response.data.lastName,
                email: response.data.email,
                phone: response.data.phone || '',
                specialization: response.data.doctorProfile?.specialization || '',
                workingTime: response.data.doctorProfile?.workingTime || null,
            });
            
            // Initialize working hours for doctors
            if (response.data.role === 'DOCTOR' && response.data.doctorProfile?.workingTime) {
                setWorkingHours(response.data.doctorProfile.workingTime);
            } else if (response.data.role === 'DOCTOR') {
                // Default working hours template
                setWorkingHours([
                    { day: 'Monday', time: '08:00 AM - 06:00 PM' },
                    { day: 'Tuesday', time: '08:00 AM - 06:00 PM' },
                    { day: 'Wednesday', time: '08:00 AM - 06:00 PM' },
                    { day: 'Thursday', time: '08:00 AM - 06:00 PM' },
                    { day: 'Friday', time: '08:00 AM - 04:00 PM' },
                    { day: 'Saturday', time: 'Closed' },
                    { day: 'Sunday', time: 'Closed' },
                ]);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const calculateYearsExperience = () => {
        if (!user?.createdAt) return 0;
        const years = new Date().getFullYear() - new Date(user.createdAt).getFullYear();
        return years;
    };

    const formatMemberSince = () => {
        if (!user?.createdAt) return 'N/A';
        return new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleEditClick = () => {
        // Initialize working hours when opening edit modal
        if (user?.role === 'DOCTOR') {
            if (user.doctorProfile?.workingTime && Array.isArray(user.doctorProfile.workingTime)) {
                setWorkingHours(user.doctorProfile.workingTime);
            } else {
                // Default template
                setWorkingHours([
                    { day: 'Monday', time: '08:00 AM - 06:00 PM' },
                    { day: 'Tuesday', time: '08:00 AM - 06:00 PM' },
                    { day: 'Wednesday', time: '08:00 AM - 06:00 PM' },
                    { day: 'Thursday', time: '08:00 AM - 06:00 PM' },
                    { day: 'Friday', time: '08:00 AM - 04:00 PM' },
                    { day: 'Saturday', time: 'Closed' },
                    { day: 'Sunday', time: 'Closed' },
                ]);
            }
        }
        setIsEditing(true);
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const updateData = { ...formData };
            
            // Add working hours for doctors
            if (user?.role === 'DOCTOR') {
                updateData.workingTime = workingHours;
            }
            
            const response = await updateUserProfile(updateData, token);
            setUser(response.data);
            setIsEditing(false);
            setSuccess('Profile updated successfully');
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleWorkingHourChange = (index: number, value: string) => {
        const newHours = [...workingHours];
        newHours[index] = { ...newHours[index], time: value };
        setWorkingHours(newHours);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#3DBEA3' }}></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 flex flex-col items-center justify-center h-full text-center">
                <div className="text-red-500 text-xl font-semibold mb-2">Error Loading Profile</div>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="bg-gray-50 min-h-full pb-10">
            {/* Modern Cover Section with Pattern */}
            <div className="relative h-64 overflow-visible" style={{ 
                background: 'linear-gradient(135deg, #1C6B5A 0%, #3DBEA3 50%, #2FA88E 100%)'
            }}>
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-32 h-32 rounded-full border-4 border-white"></div>
                    <div className="absolute bottom-10 right-20 w-48 h-48 rounded-full border-4 border-white"></div>
                    <div className="absolute top-1/2 left-1/3 w-20 h-20 rounded-full border-4 border-white"></div>
                </div>

                {/* Edit Button */}
                <div className="absolute top-6 right-8 z-10">
                    <button
                        onClick={handleEditClick}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white rounded-lg transition-all shadow-lg border border-white/20"
                    >
                        <Edit2 className="w-4 h-4" />
                        <span className="font-medium">Edit Profile</span>
                    </button>
                </div>
            </div>

            {/* Profile Picture - Below the header */}
            <div className="px-8 -mt-20">
                <div className="relative inline-block">
                    <div 
                        className="w-40 h-40 rounded-2xl p-1.5 shadow-2xl"
                        style={{ background: 'linear-gradient(135deg, #3DBEA3 0%, #2FA88E 100%)' }}
                    >
                        <div className="w-full h-full bg-white rounded-xl flex items-center justify-center">
                            <span className="text-6xl font-bold" style={{ color: '#3DBEA3' }}>
                                {user.firstName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <button 
                        className="absolute -bottom-2 -right-2 p-3 rounded-xl text-white shadow-lg border-4 border-white hover:scale-105 transition-transform"
                        style={{ backgroundColor: '#3DBEA3' }}
                    >
                        <Camera className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Profile Info Section */}
            <div className="px-8 pt-6 pb-6">
                <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                {user.firstName} {user.lastName}
                            </h1>
                            <div className="flex items-center gap-3 mb-4">
                                <span 
                                    className="px-4 py-1.5 rounded-full text-sm font-semibold text-white"
                                    style={{ backgroundColor: '#3DBEA3' }}
                                >
                                    {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                                </span>
                                {user.doctorProfile?.specialization && (
                                    <span className="px-4 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-sm font-medium">
                                        {user.doctorProfile.specialization}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-6 text-gray-600">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8F5F0' }}>
                                        <Mail className="w-4 h-4" style={{ color: '#3DBEA3' }} />
                                    </div>
                                    <span className="text-sm">{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E8F5F0' }}>
                                            <Phone className="w-4 h-4" style={{ color: '#3DBEA3' }} />
                                        </div>
                                        <span className="text-sm">{user.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        {user.role === 'DOCTOR' && (
                            <div className="flex gap-4">
                                <div className="text-center px-6 py-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                                    <p className="text-3xl font-bold text-blue-700">{calculateYearsExperience()}</p>
                                    <p className="text-xs text-blue-600 font-medium mt-1">Years Exp.</p>
                                </div>
                                <div className="text-center px-6 py-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #E8F5F0 0%, #D5EDE8 100%)' }}>
                                    <p className="text-3xl font-bold" style={{ color: '#3DBEA3' }}>{user.doctorProfile?.patientCount || 0}</p>
                                    <p className="text-xs font-medium mt-1" style={{ color: '#2FA88E' }}>Patients</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Sidebar */}
                <div className="space-y-6">
                    {/* About Card */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E8F5F0' }}>
                                <Award className="w-5 h-5" style={{ color: '#3DBEA3' }} />
                            </div>
                            <h3 className="font-semibold text-gray-800">About</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Member Since</p>
                                <p className="text-sm font-semibold text-gray-700">{formatMemberSince()}</p>
                            </div>
                            {user.role === 'ASSISTANT' && (
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Appointments Managed</p>
                                    <p className="text-sm font-semibold text-gray-700">150+</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contact Information Card */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E8F5F0' }}>
                                <Phone className="w-5 h-5" style={{ color: '#3DBEA3' }} />
                            </div>
                            <h3 className="font-semibold text-gray-800">Contact Details</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Phone Number</p>
                                    <p className="text-sm font-medium text-gray-700 truncate">{user.phone || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                                    <p className="text-sm font-medium text-gray-700 truncate">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Clinic Location</p>
                                    <p className="text-sm font-medium text-gray-700">789 Dental Avenue, Medical Center</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Statistics */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center gap-2 mb-5">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E8F5F0' }}>
                                <TrendingUp className="w-5 h-5" style={{ color: '#3DBEA3' }} />
                            </div>
                            <h3 className="font-semibold text-gray-800">Statistics</h3>
                        </div>
                        <div className="space-y-3">
                            {user.role === 'DOCTOR' && user.doctorProfile && (
                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm text-gray-700">Total Patients</span>
                                    </div>
                                    <span className="text-sm font-bold text-blue-700">{user.doctorProfile.patientCount || 0}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm text-gray-700">Member Since</span>
                                </div>
                                <span className="text-sm font-bold text-purple-700">{formatMemberSince()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Content - Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Working Schedule - Only for Doctors */}
                    {user.role === 'DOCTOR' && (
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#E8F5F0' }}>
                                    <Calendar className="w-5 h-5" style={{ color: '#3DBEA3' }} />
                                </div>
                                <h3 className="font-semibold text-gray-800">Working Schedule</h3>
                            </div>

                            <div className="grid gap-3">
                                {user.doctorProfile?.workingTime && Array.isArray(user.doctorProfile.workingTime) && user.doctorProfile.workingTime.length > 0 ? (
                                    user.doctorProfile.workingTime.map((schedule: any, index: number) => (
                                        <div 
                                            key={index} 
                                            className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: schedule.time && schedule.time !== 'Closed' ? '#E8F5F0' : '#FEE2E2' }}>
                                                    <Clock className="w-4 h-4" style={{ color: schedule.time && schedule.time !== 'Closed' ? '#3DBEA3' : '#DC2626' }} />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-700">{schedule.day || schedule.days}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-gray-600 font-medium">{schedule.time || schedule.hours || 'Not set'}</span>
                                                <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                                                    schedule.time && schedule.time !== 'Closed'
                                                        ? 'text-white'
                                                        : 'bg-red-100 text-red-700'
                                                }`} style={schedule.time && schedule.time !== 'Closed' ? { backgroundColor: '#3DBEA3' } : {}}>
                                                    {schedule.time && schedule.time !== 'Closed' ? 'Open' : 'Closed'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-sm text-gray-500">No working hours set.</p>
                                        <p className="text-xs text-gray-400 mt-1">Click Edit Profile to add your schedule.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
                            <span className="font-bold">Error:</span> {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg flex items-center gap-2">
                            <span className="font-bold">Success:</span> {success}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="First Name"
                            name="firstName"
                            value={formData.firstName || ''}
                            onChange={handleChange}
                        />
                        <Input
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                    />
                    <Input
                        label="Phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                    />
                    
                    {/* Working Hours Editor - Only for Doctors */}
                    {user?.role === 'DOCTOR' && (
                        <div className="mt-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Working Hours</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {Array.isArray(workingHours) && workingHours.length > 0 ? (
                                    workingHours.map((schedule, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <label className="w-24 text-sm text-gray-600">{schedule.day}</label>
                                            <input
                                                type="text"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={schedule.time}
                                                onChange={(e) => handleWorkingHourChange(index, e.target.value)}
                                                placeholder="e.g., 08:00 AM - 06:00 PM or Closed"
                                            />
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">Loading working hours...</p>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Enter time ranges (e.g., "08:00 AM - 06:00 PM") or "Closed" for days off</p>
                        </div>
                    )}
                    
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

