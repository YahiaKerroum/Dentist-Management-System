import React from 'react';
import { X, UserPlus } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                {title && (
                    <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#3DBEA3]/10 flex items-center justify-center">
                                <UserPlus size={20} className="text-[#3DBEA3]" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};
