"use client";

import React from 'react';
import { X } from 'lucide-react';

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-4 transition-opacity"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="w-full max-w-sm transform overflow-hidden rounded-xl bg-white p-6 text-left shadow-2xl transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-gray-900" id="modal-title">
                        {title}
                    </h3>
                    <button
                        type="button"
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        onClick={onClose}
                        aria-label="Tutup"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {children}

            </div>
        </div>
    );
}