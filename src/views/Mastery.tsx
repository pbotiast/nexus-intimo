import React, { useState, useMemo } from 'react';
import { KeyIcon, BookmarkSquareIcon } from '../components/Icons';
import Accordion from '../components/Accordion';
import { sexualPositions } from '../../data/positions';
import type { SexualPosition } from '../types';
import { openPassportModal } from '../components/PassportModal';

type FilterType = 'all' | SexualPosition['type'];

const Mastery: React.FC = () => {
    const [filter, setFilter] = useState<FilterType>('all');

    const filteredPositions = useMemo(() => {
        if (filter === 'all') {
            return sexualPositions;
        }
        return sexualPositions.filter(p => p.type === filter);
    }, [filter]);

    const filterButtons: { label: string; value: FilterType }[] = [
        { label: 'Todas', value: 'all' },
        { label: 'Intimidad', value: 'Intimidad' },
        { label: 'Placer Clitoriano', value: 'Placer Clitoriano' },
        { label: 'Placer Vaginal', value: 'Placer Vaginal' },
        { label: 'Acrobático', value: 'Acrobático' },
    ];
    
    const proseClasses = "prose prose-invert max-w-none text-brand-light/90 space-y-3 p-4";

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <header className="text-center mb-10">
                <KeyIcon className="w-12 h-12 sm:w-16 sm:h-16 text-brand-accent mx-auto mb-4" />
                <h2 className="text-4xl sm:text-5xl font-serif font-bold text-brand-light">Dominio del Arte Amatorio</h2>
                <p className="mt-2 text-lg text-brand-muted">Vuestra enciclopedia del placer. Guías y técnicas para explorar nuevos horizontes juntos.</p>
            </header>

            <div className="space-y-4 mb-12">
                 <Accordion title="Placer Masculino: Claves para su Éxtasis">
                    <div className={proseClasses}>
                        <h4>Anatomía y Zonas Clave</h4>
                        <p>El placer masculino es diverso y va más allá del glande. Conocer su cuerpo es fundamental.</p>
                        <ul>
                            <li><strong>Frenillo:</strong> La pequeña tira de piel en la parte inferior del glande. Es extremadamente sensible y responde a caricias suaves y lametones.</li>
                            <li><strong>Perineo:</strong> El área entre los testículos y el ano. Una presión firme aquí, especialmente durante el orgasmo, puede intensificarlo drásticamente.</li>
                            <li><strong>Punto P (Próstata):</strong> El "Punto G masculino". Es una glándula del tamaño de una nuez ubicada internamente, a unos 5-7 cm del ano, en la pared frontal (hacia el ombligo). Su estimulación (interna o externa a través del perineo) puede provocar orgasmos de cuerpo completo, más largos y profundos.</li>
                        </ul>
                        <h4>Técnicas para Mejorar el Placer</h4>
                        <p>La variedad es clave. Salir de la rutina de masturbación habitual puede abrir puertas a nuevas sensaciones. Experimenta con diferentes velocidades, presiones y lubricantes. Aprender a controlar la eyaculación (técnicas de "start-stop" o de apretar la base del pene) no solo prolonga el acto, sino que aumenta la intensidad del clímax final.</p>
                    </div>
                </Accordion>
                <Accordion title="El Arte del Sexo Oral: Técnicas para el Placer Mutuo">
                    <div className={proseClasses}>
                        <h4>Cunnilingus: Adorando el Clítoris</h4>
                        <p>El objetivo es el placer de ella, no necesariamente un orgasmo inmediato. La comunicación es esencial: pregúntale qué le gusta.</p>
                        <ul>
                            <li><strong>Calentamiento:</strong> Empieza con besos suaves en los muslos internos y los labios mayores. Usa la punta de la lengua para trazar círculos alrededor del clítoris.</li>
                            <li><strong>Técnicas:</strong> Varía el ritmo y la presión. Prueba lametones largos y lentos, movimientos rápidos y cortos, o una succión suave. Usa tus dedos para abrir los labios y exponer mejor el clítoris, o para estimular otras zonas al mismo tiempo.</li>
                            <li><strong>El Alfabeto:</strong> Un truco clásico es "escribir" el abecedario con la punta de la lengua sobre su clítoris. La variedad de movimientos es increíblemente estimulante.</li>
                        </ul>
                        <h4>Felación: Más Allá de Arriba y Abajo</h4>
                        <p>Una buena felación es un baile de boca, manos y lengua.</p>
                         <ul>
                            <li><strong>No ignores las bolas:</strong> Los testículos son muy sensibles. Acarícialos, chúpate los suavemente o simplemente sostenlos con la mano.</li>
                            <li><strong>Usa las manos:</strong> Mientras tu boca está en el glande, usa tu mano para masturbar el resto del pene. Esto crea una doble estimulación muy placentera.</li>
                            <li><strong>Garganta profunda (Deep Throat):</strong> No es para todos y requiere relajación. La clave es relajar los músculos de la garganta y dejar que sea él quien marque el ritmo. No fuerces. El contacto visual durante la felación puede ser increíblemente íntimo y excitante.</li>
                        </ul>
                    </div>
                </Accordion>
                 <Accordion title="Maestría del Tacto: Masturbación en Pareja">
                    <div className={proseClasses}>
                        <h4>Acariciándola a Ella</h4>
                        <p>Observa cómo se toca a sí misma para aprender qué le gusta. Empieza despacio, creando expectación. Usa lubricante generosamente. Concéntrate en el clítoris con movimientos circulares, de lado a lado o con suaves toques. Introduce los dedos en la vagina para estimular el Punto G con un movimiento de "ven aquí".</p>
                        <h4>Acariciándolo a Él</h4>
                        <p>La mano no es solo un sustituto de la vagina. Varía el agarre (más firme, más suelto), la velocidad y usa mucho lubricante para una sensación más deslizante y realista. Usa ambas manos para una sensación de "doble penetración". No olvides acariciar el frenillo y los testículos mientras lo haces.</p>
                    </div>
                </Accordion>
                <Accordion title="Sexo Anal: Guía Detallada para una Exploración Placentera">
                    <div className={proseClasses}>
                        <p>El sexo anal puede ser una fuente de inmenso placer para ambos sexos si se aborda con paciencia, comunicación y la técnica adecuada.</p>
                        <ul>
                            <li><strong>Comunicación y Consentimiento:</strong> Es el pilar fundamental. Debe ser una decisión entusiasta de ambos. Estableced una palabra de seguridad.</li>
                            <li><strong>Higiene y Preparación:</strong> Una ducha previa o un enema suave pueden aumentar la comodidad y confianza, pero no son estrictamente obligatorios. Lo más importante es la relajación.</li>
                            <li><strong>LUBRICACIÓN:</strong> No es negociable. El ano no lubrica por sí mismo. Usa una cantidad MUY generosa de lubricante de alta calidad (a base de silicona es ideal por su durabilidad). Vuelve a aplicar si es necesario.</li>
                            <li><strong>Dilatación Gradual:</strong> ¡Nunca vayas directo a la penetración! Empieza con un masaje relajante alrededor del ano. Luego, introduce un dedo (con mucho lubricante), luego dos. Deja que el músculo se acostumbre y se relaje. Los butt plugs son excelentes para esto.</li>
                            <li><strong>Penetración Lenta:</strong> Cuando ambos estéis listos, la penetración debe ser muy lenta y controlada por la persona que recibe. Posturas como la cucharita o ella encima dan más control a quien es penetrado.</li>
                        </ul>
                    </div>
                </Accordion>
                <Accordion title="Fantasías y Roles: Expandiendo Vuestros Horizontes">
                    <div className={proseClasses}>
                        <p>Las fantasías son una parte sana de la sexualidad. Compartirlas puede ser increíblemente excitante y unificador.</p>
                        <h4>Cómo Comunicar Fantasías</h4>
                        <p>Elige un momento tranquilo y sin presiones. Habla en términos de "me excita la idea de..." en lugar de "quiero que hagas...". Normaliza la conversación. Puedes usar tarjetas de deseos o empezar preguntando sobre límites y curiosidades.</p>
                        <h4>Cambio de Roles (Dominación y Sumisión)</h4>
                        <p>Explorar dinámicas de poder puede ser muy liberador. No tiene por qué ser complicado. Probad a que uno de los dos tome el control total durante una noche: decide qué hacer, cómo y cuándo, siempre dentro de los límites preestablecidos. Atar suavemente las manos con una bufanda o vendar los ojos puede aumentar la sensación de entrega y confianza. La clave es el consentimiento y la comunicación constante.</p>
                         <p><strong>Palabra de Seguridad:</strong> Antes de cualquier juego de roles o exploración de fetiches, estableced una palabra de seguridad. Debe ser algo que no se use normalmente en el contexto sexual (ej. "semáforo rojo") para detener la acción de inmediato, sin preguntas.</p>
                    </div>
                </Accordion>
            </div>
            
            <div className="bg-brand-navy p-4 sm:p-8 rounded-xl shadow-lg border border-white/10 mt-12">
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-brand-light mb-6 text-center">Galería de Posturas Sexuales</h3>
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {filterButtons.map(({ label, value }) => (
                        <button key={value} onClick={() => setFilter(value)} className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${filter === value ? 'bg-brand-accent text-white' : 'bg-brand-deep-purple text-brand-muted hover:bg-brand-accent/50'}`}>
                            {label}
                        </button>
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPositions.map(pos => (
                        <div key={pos.name} className="bg-brand-deep-purple rounded-lg overflow-hidden border border-brand-muted/20 flex flex-col">
                            <img src={pos.imageUrl} alt={pos.name} className="w-full h-40 object-cover" />
                            <div className="p-4 flex flex-col flex-grow">
                                <h4 className="font-serif text-lg sm:text-xl text-brand-light">{pos.name}</h4>
                                <span className="text-xs font-bold text-brand-accent">{pos.type}</span>
                                <p className="text-sm text-brand-muted mt-2 flex-grow">{pos.description}</p>
                                <button
                                    onClick={() => openPassportModal({ category: 'Postura Nueva', title: pos.name, notes: `Hemos probado la postura ${pos.name}.` })}
                                    className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-brand-accent font-semibold bg-brand-navy hover:bg-brand-accent/20 py-2 rounded-md transition-colors"
                                >
                                    <BookmarkSquareIcon className="w-4 h-4" />
                                    ¡Registrar Conquista!
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                 {filteredPositions.length === 0 && <p className="text-center text-brand-muted mt-8">No hay posturas en esta categoría.</p>}
            </div>
        </div>
    );
};

export default Mastery;
