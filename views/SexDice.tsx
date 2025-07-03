import React, { useState, useEffect } from 'react';
import Modal from '../src/components/Modal';
import { PencilIcon } from '../src/components/Icons';
import { useCouple } from '../src/contexts/CoupleContext';

const defaultActions = [
    'Besar apasionadamente', 
    'Lamer lentamente',
    'Morder suavemente',
    'Chupar con intensidad',
    'Acariciar con la lengua',
    'Explorar con los dedos',
    'Masajear con aceite',
    'Susurrar una fantasía sobre',
    'Desvestir con la boca',
    'Dejar una marca de amor',
    'Usar un cubito de hielo en',
    'Atar suavemente con una prenda'
];
const defaultBodyParts = [
    'Labios',
    'Cuello',
    'Pezones',
    'Pecho',
    'Abdomen',
    'Nalgas',
    'Entrepierna',
    'Clítoris',
    'Pene',
    'Vagina',
    'Testículos',
    'Ano'
];

const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const Dice: React.FC<{ value: string; isRolling: boolean }> = ({ value, isRolling }) => {
  const animationClass = isRolling ? 'animate-bounce' : '';
  return (
    <div className={`w-36 h-36 md:w-48 md:h-48 bg-brand-navy border-2 border-brand-accent shadow-lg rounded-2xl flex items-center justify-center p-4 transform transition-transform duration-500 ${animationClass}`}>
      <span className="text-brand-light font-serif text-2xl md:text-3xl text-center font-bold">{value}</span>
    </div>
  );
};

const SexDice: React.FC = () => {
  const { coupleData, api } = useCouple();

  const actions = coupleData?.sexDice?.actions?.length ? coupleData.sexDice.actions : defaultActions;
  const bodyParts = coupleData?.sexDice?.bodyParts?.length ? coupleData.sexDice.bodyParts : defaultBodyParts;

  const [dice1, setDice1] = useState<string>('Acción');
  const [dice2, setDice2] = useState<string>('Parte del Cuerpo');
  const [isRolling, setIsRolling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editableActions, setEditableActions] = useState(actions.join('\n'));
  const [editableBodyParts, setEditableBodyParts] = useState(bodyParts.join('\n'));

  useEffect(() => {
    setEditableActions(actions.join('\n'));
    setEditableBodyParts(bodyParts.join('\n'));
  }, [actions, bodyParts]);

  const rollDice = () => {
    setIsRolling(true);
  };
  
  useEffect(() => {
    if (isRolling) {
      const timer = setTimeout(() => {
        setDice1(getRandomItem(actions));
        setDice2(getRandomItem(bodyParts));
        setIsRolling(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isRolling, actions, bodyParts]);

  const handleSaveCustomLists = () => {
    const newActions = editableActions.split('\n').map(s => s.trim()).filter(Boolean);
    const newBodyParts = editableBodyParts.split('\n').map(s => s.trim()).filter(Boolean);
    api.updateSexDice({ actions: newActions, bodyParts: newBodyParts });
    setIsModalOpen(false);
  };

  const handleRestoreDefaults = () => {
    setEditableActions(defaultActions.join('\n'));
    setEditableBodyParts(defaultBodyParts.join('\n'));
    api.updateSexDice({ actions: defaultActions, bodyParts: defaultBodyParts });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <header className="mb-10 relative w-full">
        <h2 className="text-5xl font-serif font-bold text-brand-light">Dados <span className="text-brand-accent">Íntimos</span></h2>
        <p className="mt-2 text-lg text-brand-muted max-w-2xl mx-auto">Deja que el azar encienda la llama. Tira los dados y descubre una nueva combinación para jugar.</p>
        <button onClick={() => setIsModalOpen(true)} className="absolute top-0 right-0 text-brand-muted hover:text-brand-accent transition-colors p-2">
          <PencilIcon className="w-6 h-6" />
        </button>
      </header>
      
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-12">
        <Dice value={dice1} isRolling={isRolling} />
        <Dice value={dice2} isRolling={isRolling} />
      </div>

      <button onClick={rollDice} disabled={isRolling} className="bg-brand-accent text-white font-bold py-4 px-10 rounded-lg text-xl hover:bg-pink-600 transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed shadow-lg">
        {isRolling ? 'Lanzando...' : 'Lanzar los Dados'}
      </button>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h3 className="text-2xl font-serif font-bold text-brand-light mb-4">Personalizar Dados</h3>
        <p className="text-brand-muted mb-6">Añade o edita las opciones. Una por línea. Estos cambios se sincronizarán con tu pareja.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="actions" className="block text-sm font-medium text-brand-light mb-1">Acciones</label>
            <textarea id="actions" rows={8} value={editableActions} onChange={e => setEditableActions(e.target.value)} className="w-full bg-brand-deep-purple border border-brand-muted/50 rounded-lg p-2 text-brand-light focus:ring-2 focus:ring-brand-accent"></textarea>
          </div>
          <div>
            <label htmlFor="bodyParts" className="block text-sm font-medium text-brand-light mb-1">Partes del Cuerpo</label>
            <textarea id="bodyParts" rows={8} value={editableBodyParts} onChange={e => setEditableBodyParts(e.target.value)} className="w-full bg-brand-deep-purple border border-brand-muted/50 rounded-lg p-2 text-brand-light focus:ring-2 focus:ring-brand-accent"></textarea>
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
          <button onClick={handleRestoreDefaults} className="text-brand-muted hover:text-white transition-colors py-2 px-4 rounded-md text-sm">Restaurar por defecto</button>
          <div className="flex gap-3">
            <button onClick={() => setIsModalOpen(false)} className="bg-brand-navy hover:bg-brand-navy/70 text-white font-bold py-2 px-4 rounded-lg transition">Cancelar</button>
            <button onClick={handleSaveCustomLists} className="bg-brand-accent hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition">Guardar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SexDice;