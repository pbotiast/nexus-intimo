
import React from 'react';
import { Link } from 'react-router-dom';

interface CardProps {
  title: string;
  description: string;
  linkTo: string;
  imageUrl: string;
  icon: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, description, linkTo, imageUrl, icon }) => {
  return (
    <Link to={linkTo} className="block group">
      <div className="bg-brand-navy rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-brand-accent/20 transition-all duration-300 ease-in-out transform hover:-translate-y-1 h-full flex flex-col">
        <div className="relative">
          <img className="w-full h-48 object-cover" src={imageUrl} alt={title} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute top-4 right-4 bg-brand-accent/80 text-white p-2 rounded-full">
            {icon}
          </div>
        </div>
        <div className="p-6 flex-grow flex flex-col">
          <h3 className="font-serif text-2xl font-bold text-brand-light mb-2">{title}</h3>
          <p className="text-brand-muted text-sm flex-grow">{description}</p>
          <div className="mt-4 text-right">
            <span className="font-semibold text-brand-accent group-hover:underline">
              Explorar &rarr;
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default Card;