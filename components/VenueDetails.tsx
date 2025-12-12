
import React from 'react';
import { ArrowLeft, MapPin, Phone, Send, Clock, CreditCard, Share2, Check, X, User, Star } from 'lucide-react';
import { Venue, Category, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface VenueDetailsProps {
  venue: Venue;
  onBack: () => void;
  isDark: boolean;
  categories: Category[];
  lang: Language;
}

// Internal icon components for details view consistency
const GoogleMapIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.5 9.5C19.5 15.5 12 23 12 23C12 23 4.5 15.5 4.5 9.5C4.5 5.36 7.86 2 12 2C16.14 2 19.5 5.36 19.5 9.5Z" className="fill-blue-500" />
    <circle cx="12" cy="9.5" r="3.5" className="fill-white" />
  </svg>
);

const YandexMapIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" className="fill-red-500" />
    <path d="M10.5 7L12.5 12L14.5 7H16.5L13.5 13.5V17H11.5V13.5L8.5 7H10.5Z" fill="white" stroke="white" strokeWidth="0.5"/>
  </svg>
);

const VenueDetails: React.FC<VenueDetailsProps> = ({ venue, onBack, isDark, categories, lang }) => {
  const t = (key: string) => TRANSLATIONS[lang][key] || key;

  const openMap = (type: 'google' | 'yandex') => {
    const { lat, lng } = venue.location;
    const url = type === 'google' 
      ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
      : `yandexmaps://maps.yandex.ru/?pt=${lng},${lat}&z=16&l=map`;
    window.open(url, '_blank');
  };

  const AmenityItem = ({ has, label }: { has: boolean; label: string }) => (
    <div className={`flex items-center justify-between py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} last:border-0`}>
      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{label}</span>
      {has ? <Check size={18} className="text-green-500" /> : <X size={18} className="text-gray-300 dark:text-gray-600" />}
    </div>
  );

  return (
    <div className={`fixed inset-0 z-50 md:flex md:items-center md:justify-center md:bg-black/60 md:backdrop-blur-sm animate-fade-in`}>
      {/* 
         Mobile: Full screen, bg-white, padding bottom for nav.
         Desktop: Centered Box, specific width/height, rounded.
      */}
      <div className={`w-full h-full md:h-[90vh] md:max-w-5xl md:rounded-3xl md:overflow-hidden relative ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-2xl`}>
        
        {/* Scrollable Container */}
        <div className="h-full overflow-y-auto no-scrollbar pb-24 md:pb-0">
            {/* Header Image */}
            <div className="relative h-72 w-full shrink-0">
                <img src={venue.images[0]} alt={venue.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/80"></div>
                <button 
                onClick={onBack}
                className="absolute top-4 left-4 p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-colors z-20"
                >
                <ArrowLeft size={24} />
                </button>
                <div className="absolute bottom-4 left-4 right-4">
                <h1 className="text-2xl font-bold text-white mb-1">{venue.name}</h1>
                <div className="flex items-center text-gray-200 text-sm">
                    <MapPin size={14} className="mr-1" />
                    {venue.location.address}, {venue.location.district}
                </div>
                </div>
            </div>

            <div className="p-5 max-w-3xl mx-auto">
                {/* Actions */}
                <div className="flex gap-3 mb-6">
                <button 
                    onClick={() => window.open(`tel:${venue.contact.phone[0]}`)}
                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-green-700 active:scale-95 transition-all"
                >
                    <Phone size={18} />
                    {t('phone')}
                </button>
                {venue.contact.telegram && (
                    <button 
                    onClick={() => window.open(`https://t.me/${venue.contact.telegram}`)}
                    className="flex-1 bg-sky-500 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-sky-600 active:scale-95 transition-all"
                    >
                    <Send size={18} />
                    {t('telegram')}
                    </button>
                )}
                </div>

                {/* Pricing & Hours */}
                <div className={`rounded-2xl p-4 mb-6 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600">
                        <CreditCard size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('price_per_hour')}</p>
                        <p className="font-bold text-lg">{venue.pricePerHour.toLocaleString()} {venue.currency}</p>
                    </div>
                    </div>
                    {venue.hasInstallment ? (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold rounded-full">
                            {t('installment')}
                        </span>
                    ) : (
                        <span className="px-3 py-1 bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 text-xs rounded-full opacity-70">
                            {t('full_payment')}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600">
                        <Clock size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('working_hours')}</p>
                        <p className="font-medium">{venue.workingHours}</p>
                    </div>
                </div>
                </div>

                {/* Location Buttons */}
                <div className="mb-6">
                <h2 className="text-lg font-bold mb-3">{t('address')}</h2>
                <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                       <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                           <MapPin size={20} className={isDark ? "text-gray-400" : "text-gray-500"} />
                       </div>
                       <span className="text-sm font-medium leading-tight">{venue.location.address}</span>
                    </div>

                    <button 
                        onClick={() => openMap('yandex')} 
                        className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        title="Yandex Maps"
                    >
                        <YandexMapIcon />
                    </button>
                    
                    <button 
                        onClick={() => openMap('google')} 
                        className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        title="Google Maps"
                    >
                        <GoogleMapIcon />
                    </button>
                </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                <h2 className="text-lg font-bold mb-2">{t('info')}</h2>
                <p className={`leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {venue.description}
                </p>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                <h2 className="text-lg font-bold mb-3">{t('amenities')}</h2>
                <div className={`rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <AmenityItem has={venue.amenities.prayerRoom} label={t('amenity_prayer')} />
                    <AmenityItem has={venue.amenities.shower} label={t('amenity_shower')} />
                    <AmenityItem has={venue.amenities.changingRoom} label={t('amenity_changing')} />
                    <AmenityItem has={venue.amenities.parking} label={t('amenity_parking')} />
                    <AmenityItem has={venue.amenities.equipmentRental} label={t('amenity_equipment')} />
                    <AmenityItem has={venue.amenities.lighting} label={t('amenity_lighting')} />
                </div>
                </div>

                {/* Reviews */}
                <div className="mb-6">
                    <h2 className="text-lg font-bold mb-3">{t('reviews')} ({venue.reviewCount})</h2>
                    {venue.reviews.length > 0 ? (
                        <div className="space-y-4">
                            {venue.reviews.map(review => (
                                <div key={review.id} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold flex items-center gap-2">
                                            <User size={16}/> {review.userName}
                                        </span>
                                        <span className="text-xs text-gray-500">{review.date}</span>
                                    </div>
                                    <div className="flex mb-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} className={i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"} />
                                        ))}
                                    </div>
                                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">{t('no_reviews')}</p>
                    )}
                </div>

                <div className="text-center text-xs text-gray-400 mt-8 pb-4">
                    {t('added_on')}: {venue.createdAt}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VenueDetails;