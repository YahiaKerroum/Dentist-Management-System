import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ConfirmationDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    variant?: 'default' | 'danger';
}

export function ConfirmationDialog({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isLoading = false,
    variant = 'default'
}: ConfirmationDialogProps) {
    if (!isOpen) return null;

    const iconBgColor = variant === 'danger' ? 'bg-red-100' : 'bg-blue-100';
    const iconColor = variant === 'danger' ? 'text-red-600' : 'text-blue-600';
    const buttonColor = variant === 'danger' 
        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
                    onClick={!isLoading ? onCancel : undefined}
                />
                
                {/* Dialog */}
                <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-md">
                    <div className="bg-white px-6 py-5">
                        <div className="flex items-start">
                            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${iconBgColor}`}>
                                <AlertCircle className={`h-6 w-6 ${iconColor}`} />
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="text-lg font-semibold text-surface-900">
                                    {title}
                                </h3>
                                <p className="mt-2 text-sm text-surface-500">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="px-6 py-4 flex gap-6 justify-end">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="px-4 py-2 text-sm font-medium text-surface-700 bg-white border border-surface-300 rounded-lg hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isLoading}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${buttonColor}`}
                        >
                            {isLoading && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface SuccessDialogProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
    autoClose?: boolean;
}

export function SuccessDialog({ isOpen, message, onClose, autoClose = true }: SuccessDialogProps) {
    if (!isOpen) return null;

    // Auto-close after 2 seconds if enabled
    if (autoClose) {
        setTimeout(() => {
            onClose();
        }, 2000);
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
                
                <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-md">
                    <div className="bg-white px-6 py-5">
                        <div className="flex items-start">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="text-lg font-semibold text-surface-900">
                                    Success!
                                </h3>
                                <p className="mt-2 text-sm text-surface-500">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="px-6 py-4 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ErrorDialogProps {
    isOpen: boolean;
    message: string;
    onClose: () => void;
}

export function ErrorDialog({ isOpen, message, onClose }: ErrorDialogProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" onClick={onClose} />
                
                <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all w-full max-w-md">
                    <div className="bg-white px-6 py-5">
                        <div className="flex items-start">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                                <XCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="text-lg font-semibold text-surface-900">
                                    Error
                                </h3>
                                <p className="mt-2 text-sm text-surface-500">
                                    {message}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className=" px-6 py-4 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}