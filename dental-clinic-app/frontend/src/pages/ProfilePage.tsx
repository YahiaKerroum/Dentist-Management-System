import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../services/user.service';
import { User, UpdateUserDTO } from '../types/user';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { 
    Camera, 
    User as UserIcon, 
    Edit2, 
    Award, 
    Phone, 
    Mail, 
    MapPin, 
    Calendar, 
    Clock 
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            {/* Header Section with Blue Background */}
            <div className="relative h-56 bg-gradient-to-r from-blue-600 to-indigo-700">
                {/* Edit Profile Button */}
                <div className="absolute top-6 right-8">
                    <Button onClick={handleEditClick} className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm shadow-lg">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit Profile
                    </Button>
                </div>
            </div>

            {/* Profile Info Section - Overlapping the blue header */}
            <div className="relative -mt-20 px-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center gap-6">
                        {/* Profile Picture */}
                        <div className="relative flex-shrink-0">
                            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full p-1 shadow-md">
                                <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                                    <UserIcon className="w-16 h-16 text-blue-500" />
                                </div>
                            </div>
                            <button className="absolute bottom-0 right-0 p-2.5 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition shadow-lg border-4 border-white">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">
                                {user.firstName} {user.lastName}
                            </h1>
                            <p className="text-gray-600 font-medium text-lg mb-3">
                                {user.role.charAt(0) + user.role.slice(1).toLowerCase()}
                                {user.doctorProfile?.specialization && ` • ${user.doctorProfile.specialization}`}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Mail className="w-4 h-4" />
                                    <span>{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="w-4 h-4" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="mt-8 px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Stats & Contact */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">Overview</h3>
                            <Award className="w-5 h-5 text-blue-500" />
                        </div>
                        {user.role === 'DOCTOR' ? (
                            <div className="flex gap-4">
                                <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-blue-700">{calculateYearsExperience()}</p>
                                    <p className="text-xs text-blue-600 font-medium">Years Exp.</p>
                                </div>
                                <div className="flex-1 bg-indigo-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-indigo-700">{user.doctorProfile?.patientCount || 0}</p>
                                    <p className="text-xs text-indigo-600 font-medium">Patients</p>
                                </div>
                            </div>
                        ) : user.role === 'ASSISTANT' ? (
                            <div className="flex gap-4">
                                <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center">
                                    <p className="text-sm font-medium text-blue-700">Member Since</p>
                                    <p className="text-xs text-blue-600 mt-1">{formatMemberSince()}</p>
                                </div>
                                <div className="flex-1 bg-indigo-50 rounded-lg p-3 text-center">
                                    <p className="text-2xl font-bold text-indigo-700">150+</p>
                                    <p className="text-xs text-indigo-600 font-medium">Appointments</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-blue-50 rounded-lg p-3 text-center">
                                <p className="text-sm font-medium text-blue-700">Member Since</p>
                                <p className="text-xs text-blue-600 mt-1">{formatMemberSince()}</p>
                            </div>
                        )}
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Phone</p>
                                    <p className="text-sm font-medium">{user.phone || 'Not provided'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Email</p>
                                    <p className="text-sm font-medium">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Clinic Address</p>
                                    <p className="text-sm font-medium">789 Dental Avenue, Medical Center</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Schedule & Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Working Schedule - Only for Doctors */}
                    {user.role === 'DOCTOR' && (
                        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                            <div className="flex items-center gap-2 mb-6">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <h3 className="font-semibold text-gray-800">Working Schedule</h3>
                            </div>

                            <div className="grid gap-4">
                                {user.doctorProfile?.workingTime && Array.isArray(user.doctorProfile.workingTime) && user.doctorProfile.workingTime.length > 0 ? (
                                    user.doctorProfile.workingTime.map((schedule: any, index: number) => (
                                        <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">{schedule.day || schedule.days}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-sm text-gray-500">{schedule.time || schedule.hours || 'Not set'}</span>
                                                <span className={`text-xs px-2 py-1 rounded-full ${
                                                    schedule.time && schedule.time !== 'Closed'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {schedule.time && schedule.time !== 'Closed' ? 'Open' : 'Closed'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No working hours set. Click Edit Profile to add your schedule.</p>
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

