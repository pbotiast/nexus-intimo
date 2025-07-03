
import React, { useState, useRef, useEffect } from 'react';
import { audioGuides } from '../../data/audioGuides';
import type { AudioGuide } from '../types';
import { SpeakerWaveIcon } from '../components/Icons';

const formatTime = (timeInSeconds: number): string => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const getYoutubeEmbedUrl = (url: string): string | null => {
    let videoId;
    try {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v');
    } catch(e) {
        const parts = url.split('/');
        videoId = parts.pop();
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
}

const AudioGuides: React.FC = () => {
    const [activeGuide, setActiveGuide] = useState<AudioGuide | null>(audioGuides[0] || null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    const audioRef = useRef<HTMLAudioElement>(null);

    const handleSelectGuide = (guide: AudioGuide) => {
        if (activeGuide?.id !== guide.id) {
            setActiveGuide(guide);
            setIsPlaying(false);
            setProgress(0);
            setDuration(0);
            if(audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        } else {
             if (guide.sourceType === 'audio') {
                handlePlayPause();
            }
        }
    };
    
    useEffect(() => {
        if (audioRef.current && activeGuide && activeGuide.sourceType === 'audio') {
            audioRef.current.src = activeGuide.sourceUrl;
            if(isPlaying) {
                 audioRef.current.play().catch(e => console.error("Error playing audio:", e));
            }
        }
    }, [activeGuide]);
    
    const handlePlayPause = () => {
        if (!audioRef.current || activeGuide?.sourceType !== 'audio') return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(e => console.error("Error playing audio:", e));
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if(audioRef.current) {
            setProgress(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if(audioRef.current) {
            setDuration(audioRef.current.duration);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current || activeGuide?.sourceType !== 'audio') return;
        const progressBar = e.currentTarget;
        const clickPosition = e.clientX - progressBar.getBoundingClientRect().left;
        const newTime = (clickPosition / progressBar.offsetWidth) * duration;
        audioRef.current.currentTime = newTime;
        setProgress(newTime);
    };

    const handleAudioEnd = () => {
        setIsPlaying(false);
        setProgress(0);
    };


    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            <header className="text-center mb-10">
                <SpeakerWaveIcon className="w-12 h-12 sm:w-16 sm:h-16 text-brand-accent mx-auto mb-4" />
                <h2 className="text-4xl sm:text-5xl font-serif font-bold text-brand-light">Guías Sensoriales</h2>
                <p className="mt-2 text-lg text-brand-muted">Un viaje a través del sonido y la imagen. Cierra los ojos y déjate llevar.</p>
            </header>
            
            <audio 
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnd}
            />

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Player */}
                <div className="lg:col-span-3 bg-brand-navy p-6 rounded-xl shadow-lg border border-white/10 lg:sticky top-6">
                    {activeGuide ? (
                        <div className="flex flex-col items-center text-center">
                            {activeGuide.sourceType === 'youtube' ? (
                                <div className="w-full aspect-video mb-6 bg-black rounded-lg">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={getYoutubeEmbedUrl(activeGuide.sourceUrl) || ''}
                                        title={activeGuide.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="rounded-lg shadow-2xl"
                                    ></iframe>
                                </div>
                            ) : (
                                <img src={activeGuide.coverArt} alt={activeGuide.title} className="w-48 h-48 sm:w-64 sm:h-64 rounded-lg shadow-2xl mb-6 object-cover" />
                            )}
                            
                            <p className="text-sm font-bold text-brand-accent uppercase tracking-wider">{activeGuide.category}</p>
                            <h3 className="text-2xl sm:text-3xl font-serif text-brand-light my-2">{activeGuide.title}</h3>
                            <p className="text-brand-muted mb-6 h-12">{activeGuide.description}</p>
                            
                            {activeGuide.sourceType === 'audio' && (
                                <>
                                    {/* Progress Bar */}
                                    <div className="w-full space-y-2">
                                        <div className="h-2 bg-brand-deep-purple rounded-full cursor-pointer" onClick={handleSeek}>
                                            <div className="h-full bg-brand-accent rounded-full" style={{ width: `${(progress / duration) * 100 || 0}%` }}></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-brand-muted font-mono">
                                            <span>{formatTime(progress)}</span>
                                            <span>{formatTime(duration)}</span>
                                        </div>
                                    </div>
                                    
                                    {/* Controls */}
                                    <button onClick={handlePlayPause} className="mt-6 bg-brand-accent text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                                            {isPlaying ? (
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" />
                                            ) : (
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                            )}
                                        </svg>
                                    </button>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-brand-muted">Selecciona una guía para comenzar.</p>
                        </div>
                    )}
                </div>

                {/* Playlist */}
                <div className="lg:col-span-2 space-y-3">
                    <h3 className="text-2xl font-serif text-brand-light mb-4">Biblioteca de Guías</h3>
                    {audioGuides.map(guide => (
                        <div 
                            key={guide.id}
                            onClick={() => handleSelectGuide(guide)}
                            className={`p-4 rounded-lg cursor-pointer transition-colors flex items-center gap-4 ${activeGuide?.id === guide.id ? 'bg-brand-accent/20 border-l-4 border-brand-accent' : 'bg-brand-navy hover:bg-brand-navy/70'}`}
                        >
                            <img src={guide.coverArt} alt={guide.title} className="w-16 h-16 rounded-md object-cover flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-brand-light">{guide.title}</h4>
                                <p className="text-sm text-brand-muted">{guide.category} - {guide.duration}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AudioGuides;
