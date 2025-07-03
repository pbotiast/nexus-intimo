
import React from 'react';
import Modal from './Modal';
import { BellIcon } from './Icons';

interface NotificationHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationHelpModal: React.FC<NotificationHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const instructionItemStyle = "bg-brand-deep-purple p-4 rounded-lg text-left";
  const headingStyle = "font-bold text-brand-accent mb-2";
  const codeStyle = "bg-brand-navy px-2 py-1 rounded font-mono text-sm";


  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <BellIcon className="w-12 h-12 text-brand-accent mx-auto mb-4" />
        <h3 className="text-2xl font-serif font-bold text-brand-light mb-4">Reactivar Notificaciones</h3>
        <p className="text-brand-muted mb-6 max-w-md mx-auto">Para recibir recordatorios y novedades, necesitas permitir las notificaciones en la configuración de tu navegador.</p>
      </div>

      <div className="space-y-4 text-brand-light/90 text-sm">
        <div className={instructionItemStyle}>
          <h4 className={headingStyle}>Google Chrome / Edge</h4>
          <p>Copia y pega esto en tu barra de direcciones: <code className={codeStyle}>chrome://settings/content/notifications</code>, luego busca este sitio y selecciona "Permitir".</p>
        </div>
        <div className={instructionItemStyle}>
          <h4 className={headingStyle}>Mozilla Firefox</h4>
          <p>Haz clic en el icono del candado <span role="img" aria-label="lock icon">🔒</span> en la barra de direcciones. En la sección "Permisos", busca "Enviar notificaciones" y elimina el bloqueo.</p>
        </div>
        <div className={instructionItemStyle}>
          <h4 className={headingStyle}>Safari (macOS)</h4>
          <p>En el menú superior, ve a <code className={codeStyle}>Safari &gt; Ajustes... &gt; Sitios web &gt; Notificaciones</code>. Busca este sitio en la lista y selecciona "Permitir".</p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-brand-muted text-xs">Después de cambiar la configuración, necesitarás recargar la página.</p>
        <button onClick={onClose} className="mt-4 bg-brand-accent hover:bg-pink-600 text-white font-bold py-2 px-6 rounded-lg transition">
          Entendido
        </button>
      </div>
    </Modal>
  );
};

export default NotificationHelpModal;
