
import React from 'react';
import { MapPin, Star, Share2, Info } from 'lucide-react';
import { Venue, Category, Language } from '../types';
import { getCategoryColor, TRANSLATIONS } from '../constants';

interface VenueCardProps {
  venue: Venue;
  allCategories: Category[];
  isDark: boolean;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  isFavorite: boolean;
  lang: Language;
}

const VenueCard: React.FC<VenueCardProps> = ({ venue, allCategories, isDark, onClick, onToggleFavorite, onShare, isFavorite, lang }) => {
  const mainCategory = allCategories.find(c => c.id === venue.categories[0]);
  const categoryColorClass = mainCategory ? getCategoryColor(mainCategory.type, isDark) : 'bg-gray-100 text-gray-800';
  const t = (key: string) => TRANSLATIONS[lang][key] || key;
  const categoryName = mainCategory ? (TRANSLATIONS[lang]['cat_' + mainCategory.id] || mainCategory.name) : 'Sport';

  return (
    <div 
      onClick={onClick}
      className={`group relative flex flex-col w-full rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
        isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
      } border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
    >
      {/* Image Container */}
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={venue.images[0]} 
          alt={venue.name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${categoryColorClass}`}>
                {categoryName}
            </span>
            {venue.hasInstallment && (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500 text-white backdrop-blur-md">
                    {t('installment')}
                </span>
            )}
        </div>
        
        <button 
          onClick={onToggleFavorite}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-red-500 hover:text-white transition-colors"
        >
          <Star size={18} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "text-yellow-400" : ""} />
        </button>
        
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
             <div className="flex items-center text-white text-xs">
                <MapPin size={12} className="mr-1" />
                <span className="truncate">{venue.location.district}, {venue.location.region}</span>
             </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
            <div className="flex justify-between items-start mb-1">
                <h3 className={`text-lg font-bold leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {venue.name}
                </h3>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center text-yellow-500 text-sm font-medium">
                    <Star size={14} fill="currentColor" className="mr-1"/>
                    {venue.rating} <span className={`text-xs ml-1 font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>({venue.reviewCount})</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-md ${venue.isOpenNow ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {venue.isOpenNow ? t('open') : t('closed')}
                </span>
            </div>
        </div>

        <div className="mt-2 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-end">
             <div className="flex flex-col">
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{t('price_per_hour')}</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {venue.pricePerHour.toLocaleString()} {venue.currency}
                </span>
             </div>
             
             <div className="flex items-center gap-2">
                 <button 
                    onClick={onShare}
                    className={`p-2 rounded-xl border transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' : 'border-gray-300 text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                    title={t('share')}
                 >
                     <Share2 size={18} />
                 </button>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    className={`px-3 py-2 rounded-xl border text-xs font-bold uppercase transition-colors ${isDark ? 'border-blue-500 text-blue-400 hover:bg-blue-500/10' : 'border-blue-600 text-blue-600 hover:bg-blue-50'}`}
                 >
                     {t('details')}
                 </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default VenueCard;
