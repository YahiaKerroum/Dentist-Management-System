import {
    X,
    Stethoscope,
    User,
    Calendar,
    Phone,
    Mail,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    Edit2,
    ExternalLink,
    ClipboardList,
} from 'lucide-react';
import { Treatment, TreatmentType, TREATMENT_TYPE_CONFIG, TEETH_QUADRANTS } from '../../types/treatment';

// Helper component for treatment type icon
const TreatmentTypeIcon = ({ type, size = 'md' }: { type: TreatmentType; size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
    const config = TREATMENT_TYPE_CONFIG[type];
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
    };
    return (
        <img 
            src={config.iconPath} 
            alt={config.label}
            className={`${sizeClasses[size]} object-contain`}
        />
    );
};

interface TreatmentDetailPanelProps {
    treatment: Treatment;
    onClose: () => void;
    onEdit: () => void;
    onNavigateToPatient?: (patientId: string) => void;
}

export function TreatmentDetailPanel({
    treatment,
    onClose,
    onEdit,
    onNavigateToPatient,
}: TreatmentDetailPanelProps) {
    const typeConfig = TREATMENT_TYPE_CONFIG[treatment.typeOfTreatment];

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handlePatientClick = () => {
        console.log('handlePatientClick called, patientId:', treatment.patientId);
        console.log('onNavigateToPatient exists:', !!onNavigateToPatient);
        if (onNavigateToPatient) {
            onNavigateToPatient(treatment.patientId);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-end z-50">
            <div
                className="bg-white w-full max-w-xl h-full overflow-hidden shadow-2xl animate-slide-in-right"
                style={{
                    animation: 'slideInRight 0.3s ease-out',
                }}
            >
                <style>{`
                    @keyframes slideInRight {
                        from { transform: translateX(100%); }
                        to { transform: translateX(0); }
                    }
                `}</style>

                {/* Header */}
                <div
                    className="px-6 py-5 border-b"
                    style={{ backgroundColor: typeConfig.bgColor }}
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `${typeConfig.color}20` }}
                            >
                                <TreatmentTypeIcon type={treatment.typeOfTreatment} size="xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold" style={{ color: typeConfig.color }}>
                                    {typeConfig.label}
                                </h2>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onEdit}
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                                title="Edit treatment"
                            >
                                <Edit2 className="w-5 h-5 text-gray-600" />
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Treatment Description */}
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                        {typeConfig.description}
                    </p>

                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        {treatment.completed ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                <CheckCircle2 className="w-4 h-4" />
                                Completed
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                                <Clock className="w-4 h-4" />
                                In Progress
                            </span>
                        )}
                        {treatment.followUpRequired && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-100 text-rose-700 rounded-full text-sm font-medium">
                                <AlertCircle className="w-4 h-4" />
                                Follow-up Required
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto h-[calc(100%-140px)]">
                    {/* Date & Time */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5" style={{ color: '#3DBEA3' }} />
                            <span className="text-lg font-semibold text-gray-900">
                                {formatDate(treatment.dateOfTreatment)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 ml-8">
                            Created {formatTime(treatment.createdAt)}
                        </p>
                    </div>

                    {/* Patient Card */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Patient Information
                        </h3>
                        <div
                            onClick={handlePatientClick}
                            className={`rounded-xl p-4 border ${
                                onNavigateToPatient ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                            }`}
                            style={{ background: 'linear-gradient(to bottom right, #E8F5F0, #D5EDE8)', borderColor: '#D5EDE8' }}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg" style={{ background: 'linear-gradient(to bottom right, #3DBEA3, #2FA88E)' }}>
                                        {treatment.patient.firstName[0]}{treatment.patient.lastName[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">
                                            {treatment.patient.firstName} {treatment.patient.lastName}
                                        </h4>
                                        <div className="flex items-center gap-4 mt-1">
                                            {treatment.patient.phone && (
                                                <span className="flex items-center gap-1 text-sm text-gray-600">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    {treatment.patient.phone}
                                                </span>
                                            )}
                                            {treatment.patient.email && (
                                                <span className="flex items-center gap-1 text-sm text-gray-600">
                                                    <Mail className="w-3.5 h-3.5" />
                                                    {treatment.patient.email}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {onNavigateToPatient && (
                                    <ExternalLink className="w-5 h-5" style={{ color: '#3DBEA3' }} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Doctor Card */}
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Stethoscope className="w-4 h-4" />
                            Attending Doctor
                        </h3>
                        <div className="rounded-xl p-4 border" style={{ backgroundColor: '#E8F5F0', borderColor: '#D5EDE8' }}>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg" style={{ background: 'linear-gradient(to bottom right, #3DBEA3, #2FA88E)' }}>
                                    {treatment.doctor.user.firstName[0]}{treatment.doctor.user.lastName[0]}
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">
                                        Dr. {treatment.doctor.user.firstName} {treatment.doctor.user.lastName}
                                    </h4>
                                    {treatment.doctor.specialization && (
                                        <p className="text-sm" style={{ color: '#3DBEA3' }}>{treatment.doctor.specialization}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Teeth Involved */}
                    {treatment.teethInvolved.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                🦷 Teeth Involved
                            </h3>
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex flex-col gap-3">
                                    {/* Upper teeth */}
                                    <div className="flex justify-center gap-1">
                                        <div className="flex gap-1">
                                            {TEETH_QUADRANTS.upperRight.map((tooth) => (
                                                <div
                                                    key={tooth}
                                                    className={`w-6 h-7 rounded text-xs font-medium flex items-center justify-center ${
                                                        treatment.teethInvolved.includes(tooth)
                                                            ? 'bg-teal-500 text-white shadow-md'
                                                            : 'bg-white border border-gray-200 text-gray-400'
                                                    }`}
                                                >
                                                    {tooth}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="w-px bg-gray-300 mx-1" />
                                        <div className="flex gap-1">
                                            {TEETH_QUADRANTS.upperLeft.map((tooth) => (
                                                <div
                                                    key={tooth}
                                                    className={`w-6 h-7 rounded text-xs font-medium flex items-center justify-center ${
                                                        treatment.teethInvolved.includes(tooth)
                                                            ? 'bg-teal-500 text-white shadow-md'
                                                            : 'bg-white border border-gray-200 text-gray-400'
                                                    }`}
                                                >
                                                    {tooth}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 my-1" />
                                    {/* Lower teeth */}
                                    <div className="flex justify-center gap-1">
                                        <div className="flex gap-1">
                                            {TEETH_QUADRANTS.lowerLeft.map((tooth) => (
                                                <div
                                                    key={tooth}
                                                    className={`w-6 h-7 rounded text-xs font-medium flex items-center justify-center ${
                                                        treatment.teethInvolved.includes(tooth)
                                                            ? 'bg-teal-500 text-white shadow-md'
                                                            : 'bg-white border border-gray-200 text-gray-400'
                                                    }`}
                                                >
                                                    {tooth}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="w-px bg-gray-300 mx-1" />
                                        <div className="flex gap-1">
                                            {TEETH_QUADRANTS.lowerRight.map((tooth) => (
                                                <div
                                                    key={tooth}
                                                    className={`w-6 h-7 rounded text-xs font-medium flex items-center justify-center ${
                                                        treatment.teethInvolved.includes(tooth)
                                                            ? 'bg-teal-500 text-white shadow-md'
                                                            : 'bg-white border border-gray-200 text-gray-400'
                                                    }`}
                                                >
                                                    {tooth}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center text-sm text-gray-500 mt-3">
                                    {treatment.teethInvolved.length} tooth/teeth treated: {treatment.teethInvolved.join(', ')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Procedure Details */}
                    {treatment.procedure && (
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <ClipboardList className="w-4 h-4" />
                                Procedure Details
                            </h3>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <p className="text-gray-700 whitespace-pre-wrap">{treatment.procedure}</p>
                            </div>
                        </div>
                    )}

                    {/* Clinical Notes */}
                    {treatment.notes && (
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Clinical Notes
                            </h3>
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                <p className="text-gray-700 whitespace-pre-wrap">{treatment.notes}</p>
                            </div>
                        </div>
                    )}

                    {/* Appointment Link */}
                    {treatment.appointment && (
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Linked Appointment
                            </h3>
                            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-indigo-900">
                                        {new Date(treatment.appointment.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                    <p className="text-sm text-indigo-600 capitalize">
                                        {treatment.appointment.status.toLowerCase().replace('_', ' ')}
                                    </p>
                                </div>
                                <span className="text-xs text-indigo-400 font-mono">
                                    ID: {treatment.appointment.id.slice(0, 8)}...
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Record Info */}
                    <div className="mt-8 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Created: {new Date(treatment.createdAt).toLocaleString()}</span>
                            <span>Updated: {new Date(treatment.updatedAt).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-gray-300 mt-1 font-mono">ID: {treatment.id}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
