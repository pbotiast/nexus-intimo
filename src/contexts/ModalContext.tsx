// src/contexts/ModalContext.tsx
import React, { createContext, useState, useContext, ReactNode } from 'react';
import ConfirmModal, { ConfirmModalProps } from '../components/ConfirmModal';
import PassportModal, { PassportModalProps } from '../components/PassportModal';
// Importa otros modales aquí si los tienes

type ModalType = 'confirm' | 'passport'; // | 'otroModal'

interface ModalState {
  confirm: ConfirmModalProps & { isOpen: boolean };
  passport: PassportModalProps & { isOpen: boolean };
}

interface ModalContextType {
  showModal: <T extends ModalType>(modalType: T, props: Omit<ModalState[T], 'isOpen'>) => void;
  hideModal: (modalType: ModalType) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modals, setModals] = useState<ModalState>({
    confirm: { isOpen: false, title: '', message: '', onConfirm: () => {} },
    passport: { isOpen: false, onStamp: () => {} },
  });

  const showModal = <T extends ModalType>(modalType: T, props: Omit<ModalState[T], 'isOpen'>) => {
    setModals(prev => ({
      ...prev,
      [modalType]: { ...props, isOpen: true },
    }));
  };

  const hideModal = (modalType: ModalType) => {
    setModals(prev => ({
      ...prev,
      [modalType]: { ...prev[modalType], isOpen: false },
    }));
  };

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      {modals.confirm.isOpen && <ConfirmModal {...modals.confirm} onClose={() => hideModal('confirm')} />}
      {modals.passport.isOpen && <PassportModal {...modals.passport} onClose={() => hideModal('passport')} />}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal debe ser usado dentro de un ModalProvider');
  }
  return context;
};