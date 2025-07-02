import React, { useState } from 'react';
import Accordion from '../components/Accordion';
import { HeartIcon } from '../components/Icons';
import { PersonalChallenge } from '../types';
import Loader from '../components/Loader';
import FeedbackWidget from '../components/FeedbackWidget';
import { useAiPreferences } from '../hooks/useAiPreferences';
import { useCouple } from '../contexts/CoupleContext';

const MyJourney: React.FC = () => {
  const { api } = useCouple();
  const [challenge, setChallenge] = useState<PersonalChallenge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { recordFeedback } = useAiPreferences();

  const handleGenerateChallenge = async () => {
    setIsLoading(true);
    setError(null);
    setChallenge(null);
    try {
      const result = await api.generatePersonalChallenge();
      setChallenge(result);
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error desconocido.');
    } finally {
      setIsLoading(false);
    }
  };

  const proseClasses = "prose prose-invert max-w-none text-brand-light/90 space-y-3 p-4";

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <header className="text-center mb-10">
        <HeartIcon className="w-12 h-12 sm:w-16 sm:h-16 text-brand-accent mx-auto mb-4" />
        <h2 className="text-4xl sm:text-5xl font-serif font-bold text-brand-light">Mi Placer, Mi Viaje</h2>
        <p className="mt-2 text-lg text-brand-muted">Un espacio sagrado para tu autoconocimiento, empoderamiento y placer.</p>
      </header>
      
      <div className="space-y-4 mb-12">
        <Accordion title="El Clítoris: Anatomía Completa del Placer">
          <div className={proseClasses}>
            <p>El clítoris es el único órgano humano dedicado exclusivamente al placer. Lo que vemos, el <strong>glande del clítoris</strong>, es solo la punta del iceberg. En realidad, es una estructura compleja que se extiende dentro del cuerpo.</p>
            <ul>
              <li><strong>Glande:</strong> La parte externa y visible, extremadamente sensible con más de 8,000 terminaciones nerviosas (el doble que el pene).</li>
              <li><strong>Cuerpo y Cruras (piernas):</strong> El cuerpo se divide en dos "piernas" o cruras que se extienden hacia abajo y rodean la uretra y la vagina. Miden varios centímetros y se llenan de sangre durante la excitación, igual que el pene.</li>
              <li><strong>Bulbos Vestibulares:</strong> Dos bulbos de tejido eréctil a cada lado de la abertura vaginal que también se hinchan con la excitación, contribuyendo a la sensación de "plenitud" y al placer durante la penetración.</li>
            </ul>
            <p>Conocer su anatomía completa te ayuda a entender que la estimulación no tiene por qué limitarse a la parte externa. Acariciar los labios y la zona perineal también estimula indirectamente las partes internas del clítoris.</p>
          </div>
        </Accordion>
        <Accordion title="Tipos de Orgasmos Femeninos: Un Universo de Placer">
           <div className={proseClasses}>
            <p>No existe un tipo de orgasmo "superior" a otro. El cuerpo femenino es capaz de experimentar placer de múltiples formas, y todas son válidas. Los más comunes son:</p>
            <ul>
                <li><strong>Orgasmo Clitoriano:</strong> El más común y fácil de alcanzar para la mayoría de las mujeres. Se logra por la estimulación directa o indirecta del clítoris. Es intenso y centrado en la zona genital externa.</li>
                <li><strong>Orgasmo Vaginal (Punto G):</strong> El famoso "Punto G" no es un botón mágico, sino una zona en la pared frontal de la vagina (a unos 5-8 cm de la entrada) que, al ser estimulada con presión, activa partes internas del clítoris (las cruras y los bulbos). Su estimulación puede llevar a un orgasmo más profundo y expansivo.</li>
                <li><strong>Orgasmo Mixto:</strong> Ocurre cuando se estimula el clítoris y el Punto G simultáneamente, llevando a una experiencia increíblemente potente y completa.</li>
                <li><strong>Otros Orgasmos:</strong> Algunas mujeres reportan orgasmos a través de la estimulación de los pezones, el cérvix o incluso orgasmos puramente mentales (sin contacto físico). ¡Tu cuerpo es un mapa de placer por descubrir!</li>
            </ul>
          </div>
        </Accordion>
        <Accordion title="El Suelo Pélvico: El Músculo Secreto del Placer">
          <div className={proseClasses}>
            <p>El suelo pélvico es un conjunto de músculos que sostiene tus órganos pélvicos. Un suelo pélvico fuerte no solo previene problemas de salud, sino que es clave para orgasmos más intensos.</p>
            <p>Los <strong>ejercicios de Kegel</strong> (contraer y relajar estos músculos como si aguantaras las ganas de orinar) aumentan el flujo sanguíneo a la zona, mejoran la lubricación y te dan más control sobre las contracciones orgásmicas, haciéndolas más fuertes y duraderas.</p>
            <p><strong>Práctica:</strong> Durante la masturbación, prueba a contraer tu suelo pélvico justo antes del clímax. Notarás cómo la intensidad se dispara.</p>
          </div>
        </Accordion>
        <Accordion title="Lubricación: Tu Mejor Aliada para el Placer">
          <div className={proseClasses}>
            <p>La lubricación, ya sea natural o añadida, es fundamental. Reduce la fricción, aumenta el confort y potencia las sensaciones. La falta de lubricación puede deberse a estrés, cambios hormonales o simplemente no estar suficientemente excitada, y no es motivo de vergüenza.</p>
            <ul>
              <li><strong>A base de agua:</strong> La opción más versátil y segura con todos los juguetes sexuales y preservativos. Se limpia fácilmente.</li>
              <li><strong>A base de silicona:</strong> Dura mucho más y es ideal para el agua (ducha, bañera) y el sexo anal. No debe usarse con juguetes de silicona, ya que puede degradarlos.</li>
              <li><strong>A base de aceite:</strong> Muy hidratante y genial para masajes, pero puede dañar los preservativos de látex y algunos juguetes.</li>
            </ul>
            <p>Usar lubricante no es una señal de que "algo falla", sino una herramienta inteligente para maximizar el placer para ti y tu pareja.</p>
          </div>
        </Accordion>
      </div>

      <div className="bg-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-white/10 text-center">
        <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand-light mb-4">Reto Personal por IA</h3>
        <p className="text-brand-muted mb-6">¿Lista para un nuevo descubrimiento? Deja que nuestra IA te proponga un reto personalizado para tu viaje de autoexploración.</p>
        <button onClick={handleGenerateChallenge} disabled={isLoading} className="bg-brand-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-600 transition duration-300 disabled:bg-gray-500 disabled:cursor-not-allowed">
          {isLoading ? 'Generando Reto...' : 'Generar Mi Reto'}
        </button>
        
        {isLoading && <Loader text="Creando una nueva experiencia para ti..."/>}
        {error && <div className="mt-6 bg-red-900/50 border border-red-700 text-red-200 p-4 rounded-lg">{error}</div>}

        {challenge && (
          <div className="mt-8 text-left bg-brand-deep-purple p-6 rounded-lg animate-fade-in border border-brand-accent/50">
            <h4 className="text-2xl font-serif text-brand-accent mb-2">{challenge.title}</h4>
            <p className="text-sm text-brand-muted mb-4">Enfoque: {challenge.focus}</p>
            <p className="text-brand-light/90 whitespace-pre-wrap">{challenge.description}</p>
            <FeedbackWidget onFeedback={(feedback) => recordFeedback('challenge_type', challenge.focus, feedback)} contentId={challenge.title}/>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJourney;
