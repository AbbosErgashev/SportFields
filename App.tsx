import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Filter, Home, Map as MapIcon, Heart, User, Moon, Sun, MapPin, Calendar, Clock, Phone, Send, MessageCircle, Plus, Minus, ExternalLink, Navigation, ChevronRight, X, Globe } from 'lucide-react';
import VenueCard from './components/VenueCard';
import VenueDetails from './components/VenueDetails';
import FilterModal from './components/FilterModal';
import ShareModal from './components/ShareModal';
import { CATEGORIES, MOCK_VENUES, REGIONS, TRANSLATIONS } from './constants';
import { Venue, FilterState, UserProfile, Language } from './types';

// Simple Brand Icons
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

function App() {
  // State
  const [isDark, setIsDark] = useState(false);
  const [lang, setLang] = useState<Language>('uz');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'favorites' | 'map' | 'profile'>('home');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [sharingVenue, setSharingVenue] = useState<Venue | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Translation Helper
  const t = (key: string) => TRANSLATIONS[lang][key] || key;

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    categoryId: null,
    region: null,
    district: null,
    hasShower: false,
    hasPrayerRoom: false,
    hasEquipmentRental: false,
    hasInstallment: false,
    onlyOpen: false,
  });

  // User Data (Mock)
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'user1',
    name: 'Foydalanuvchi',
    favorites: [],
    contactHistory: [],
    myReviews: []
  });

  // Initialize
  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }

    // Geolocation Request (Simulation)
    const hasAsked = localStorage.getItem('hasAskedLocation');
    if (!hasAsked) {
      const confirmLoc = window.confirm("Ilova lokatsiyangizdan foydalanishiga ruxsat berasizmi? Bu sizga yaqin sport maydonlarini topishga yordam beradi.");
      localStorage.setItem('hasAskedLocation', 'true');
      if (confirmLoc) {
        // Simulate getting Tashkent
        setFilters(prev => ({...prev, region: 'Toshkent shahri'}));
      }
    }
  }, []);

  // Effect for Dark Mode class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Filtering Logic
  const filteredVenues = useMemo(() => {
    return MOCK_VENUES.filter(venue => {
      // Search
      if (searchQuery && !venue.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      
      // Categories
      if (filters.categoryId && !venue.categories.includes(filters.categoryId)) return false;

      // Region & District
      if (filters.region && venue.location.region !== filters.region) return false;
      if (filters.district && venue.location.district !== filters.district) return false;

      // Amenities
      if (filters.hasShower && !venue.amenities.shower) return false;
      if (filters.hasPrayerRoom && !venue.amenities.prayerRoom) return false;
      if (filters.hasEquipmentRental && !venue.amenities.equipmentRental) return false;
      if (filters.hasInstallment && !venue.hasInstallment) return false;
      if (filters.onlyOpen && !venue.isOpenNow) return false;

      // Favorites View
      if (currentView === 'favorites' && !userProfile.favorites.includes(venue.id)) return false;

      return true;
    });
  }, [filters, searchQuery, currentView, userProfile.favorites]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setUserProfile(prev => {
      const isFav = prev.favorites.includes(id);
      return {
        ...prev,
        favorites: isFav ? prev.favorites.filter(fid => fid !== id) : [...prev.favorites, id]
      };
    });
  };

  const handleShareClick = (e: React.MouseEvent, venue: Venue) => {
    e.stopPropagation();
    setSharingVenue(venue);
  };

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
  };

  const handleNavigation = (view: 'home' | 'favorites' | 'map' | 'profile') => {
    setCurrentView(view);
    setSelectedVenue(null); // Close venue details when navigating via menu
  };

  // Map View Component
  const MapView = () => {
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [activePin, setActivePin] = useState<string | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);

    // Prevent default browser zoom/scroll behavior within the map container
    useEffect(() => {
        const mapEl = mapRef.current;
        if (!mapEl) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const zoomSensitivity = 0.001;
            const newZoom = Math.min(Math.max(zoom - e.deltaY * zoomSensitivity, 0.5), 4);
            setZoom(newZoom);
        };

        // Use { passive: false } to allow preventDefault()
        mapEl.addEventListener('wheel', handleWheel, { passive: false });
        
        return () => {
            mapEl.removeEventListener('wheel', handleWheel);
        };
    }, [zoom]); 

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));

    // Determine color based on rating
    const getPinColor = (rating: number) => {
      if (rating >= 5.0) return 'bg-emerald-600 border-emerald-800'; // Yam yashil
      if (rating >= 4.7) return 'bg-green-500 border-green-700'; // Yashil
      if (rating >= 4.4) return 'bg-lime-500 border-lime-700'; // Sariq aralash yashil
      if (rating >= 4.0) return 'bg-yellow-400 border-yellow-600 text-gray-900'; // Sariq
      if (rating >= 3.5) return 'bg-orange-500 border-orange-700'; // Qizil aralash sariq
      return 'bg-red-600 border-red-800'; // Qizil
    };

    const activeVenue = filteredVenues.find(v => v.id === activePin);

    const openExternalMap = (type: 'google' | 'yandex') => {
        if (!activeVenue) return;
        const { lat, lng } = activeVenue.location;
        const url = type === 'google' 
          ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
          : `yandexmaps://maps.yandex.ru/?pt=${lng},${lat}&z=16&l=map`;
        window.open(url, '_blank');
    };

    return (
      <div className="relative w-full h-[calc(100vh-140px)] bg-gray-100 dark:bg-gray-800 rounded-3xl overflow-hidden mt-4 border border-gray-200 dark:border-gray-700 shadow-inner">
        {/* Map Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
            <button onClick={handleZoomIn} className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <Plus size={24} />
            </button>
            <button onClick={handleZoomOut} className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                <Minus size={24} />
            </button>
        </div>

        {/* Map Area */}
        <div 
            ref={mapRef}
            className={`w-full h-full cursor-${isDragging ? 'grabbing' : 'grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div 
                className="w-full h-full transition-transform duration-100 ease-out origin-center"
                style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
            >
                {/* Background (Mock Map Pattern) */}
                <div className="absolute inset-[-100%] w-[300%] h-[300%] opacity-20 pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Tashkent_location_map.svg/1200px-Tashkent_location_map.svg.png')] bg-repeat opacity-10"></div>
                
                {/* Pins */}
                {filteredVenues.map((v, i) => {
                    const pseudoRandom = (seed: string) => {
                        let h = 0xdeadbeef;
                        for(let i=0; i<seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
                        return ((h ^ h >>> 16) >>> 0) / 4294967296;
                    }
                    const top = 10 + (pseudoRandom(v.id + 'y') * 80);
                    const left = 10 + (pseudoRandom(v.id + 'x') * 80);
                    const isActive = activePin === v.id;

                    return (
                        <div 
                            key={v.id}
                            onClick={(e) => { e.stopPropagation(); setActivePin(v.id); }}
                            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${isActive ? 'z-50 scale-125' : 'z-10 hover:scale-110 hover:z-40'}`}
                            style={{ top: `${top}%`, left: `${left}%` }}
                        >
                            <div className={`p-2 rounded-full shadow-lg border-2 text-white ${getPinColor(v.rating)}`}>
                                <MapPin size={isActive ? 24 : 20} fill="currentColor" />
                            </div>
                            {/* Simple Label for inactive pins */}
                            {!isActive && zoom > 1.5 && (
                                <div className="mt-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold shadow whitespace-nowrap text-center">
                                    {v.name}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Active Pin Popup (Overlay) */}
        {activeVenue && (
            <div className="absolute bottom-6 left-6 right-6 md:left-auto md:right-auto md:top-6 md:bottom-auto md:w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 z-30 animate-slide-in border border-gray-100 dark:border-gray-700">
                <button 
                    onClick={() => setActivePin(null)} 
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <X size={18} />
                </button>
                
                <h3 className="font-bold text-lg pr-6 mb-1">{activeVenue.name}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <MapPin size={14} />
                    <span className="truncate">{activeVenue.location.address}</span>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-0.5 text-xs font-bold text-white rounded ${getPinColor(activeVenue.rating).split(' ')[0]}`}>
                        {activeVenue.rating}
                    </span>
                    <span className="text-xs text-gray-400">({activeVenue.reviewCount} {t('reviews')})</span>
                </div>

                {/* Compact Buttons Row */}
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setSelectedVenue(activeVenue)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        {t('details')}
                        <ChevronRight size={16} />
                    </button>
                    
                    <button 
                        onClick={() => openExternalMap('yandex')} 
                        className="w-12 h-10 flex items-center justify-center bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-900 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                        title="Yandex Maps"
                    >
                        <YandexMapIcon />
                    </button>
                    
                    <button 
                        onClick={() => openExternalMap('google')} 
                        className="w-12 h-10 flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        title="Google Maps"
                    >
                        <GoogleMapIcon />
                    </button>
                </div>
            </div>
        )}
      </div>
    );
  };

  // Profile View
  const ProfileView = () => {
    // Mock Contact History Data (Replacing Booking History)
    const historyItems = [
        {
            id: 'h1',
            venueName: 'Bunyodkor Mini Football',
            date: 'Bugun',
            time: '14:30',
            action: 'phone',
            actionLabel: t('call'),
            image: 'https://loremflickr.com/800/600/stadium?lock=1',
            category: t('cat_football')
        },
        {
            id: 'h2',
            venueName: 'Paxtakor Training Field',
            date: 'Kecha',
            time: '18:20',
            action: 'telegram',
            actionLabel: "Telegram",
            image: 'https://loremflickr.com/800/600/football?lock=5',
            category: t('cat_football')
        },
        {
            id: 'h3',
            venueName: 'NBU Tennis Club',
            date: '20 Noyabr',
            time: '10:05',
            action: 'phone',
            actionLabel: t('call'),
            image: 'https://loremflickr.com/800/600/tennis?lock=53',
            category: t('cat_tennis')
        },
    ];

    const getActionIcon = (action: string) => {
        switch(action) {
            case 'phone': return <Phone size={14} />;
            case 'telegram': return <Send size={14} />;
            case 'whatsapp': return <MessageCircle size={14} />;
            default: return <Phone size={14} />;
        }
    };

    const getActionColor = (action: string) => {
        switch(action) {
            case 'phone': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'telegram': return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400';
            case 'whatsapp': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
      <div className="p-4">
          <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                  {userProfile.name.charAt(0)}
              </div>
              <div>
                  <h2 className="text-xl font-bold">{userProfile.name}</h2>
                  <p className="text-gray-500 text-sm">+998 90 123 45 67</p>
              </div>
          </div>

          <div className="space-y-4">
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
                  <h3 className="font-bold mb-4">{t('contact_history')}</h3>
                  <div className="space-y-3">
                      {historyItems.map((item) => (
                          <div key={item.id} className={`flex gap-3 pb-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} last:border-0 last:pb-0`}>
                              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative">
                                  <img src={item.image} alt={item.venueName} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-start mb-1">
                                      <h4 className="font-bold text-sm line-clamp-1">{item.venueName}</h4>
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ${getActionColor(item.action)}`}>
                                          {getActionIcon(item.action)}
                                          {item.actionLabel}
                                      </span>
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                                      <span className="flex items-center gap-1"><Calendar size={12}/> {item.date}</span>
                                      <span className="flex items-center gap-1"><Clock size={12}/> {item.time}</span>
                                  </div>
                                  <div className="text-xs font-medium text-gray-400">
                                      {item.category}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <h3 className="font-bold mb-2">{t('review_history')}</h3>
                      <div className="py-2 opacity-50 text-sm italic">{t('no_reviews')}</div>
                  </div>
              </div>
          </div>
      </div>
    );
  };

  const getFlag = (l: Language) => {
    switch(l) {
        case 'uz': return '🇺🇿 UZ';
        case 'ru': return '🇷🇺 RU';
        case 'en': return '🇺🇸 EN';
        default: return '🇺🇿 UZ';
    }
  };

  return (
    <div className={`min-h-screen pb-24 md:pb-0 transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Top Header */}
      <div className={`sticky top-0 z-30 px-4 py-3 ${isDark ? 'bg-gray-900/95' : 'bg-white/95'} backdrop-blur-sm border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent cursor-pointer" onClick={() => handleNavigation('home')}>
            Sport Fields
          </h1>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mx-4">
               <button onClick={() => handleNavigation('home')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'home' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>{t('home')}</button>
               <button onClick={() => handleNavigation('favorites')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'favorites' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>{t('favorites')}</button>
               <button onClick={() => handleNavigation('map')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'map' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>{t('map')}</button>
               <button onClick={() => handleNavigation('profile')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === 'profile' ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}>{t('profile')}</button>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <div className="relative">
                <button 
                    onClick={() => setIsLangOpen(!isLangOpen)}
                    className={`px-3 py-2 rounded-xl flex items-center gap-1 font-bold text-xs ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                    {getFlag(lang)}
                </button>
                {isLangOpen && (
                    <div className={`absolute top-full right-0 mt-2 w-24 rounded-xl shadow-lg border overflow-hidden py-1 z-50 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        {(['uz', 'ru', 'en'] as Language[]).map((l) => (
                            <button
                                key={l}
                                onClick={() => { setLang(l); setIsLangOpen(false); }}
                                className={`w-full text-left px-3 py-2 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 ${lang === l ? 'text-blue-500' : isDark ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                                {getFlag(l)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Dark Mode Toggle */}
             <button 
                onClick={() => setIsDark(!isDark)}
                className={`p-2 rounded-xl relative ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                title={isDark ? t('light_mode') : t('dark_mode')}
              >
                {isDark ? <Sun size={20}/> : <Moon size={20}/>}
              </button>

            {/* Filter Toggle */}
            <button 
                onClick={() => setIsFilterOpen(true)}
                className={`p-2 rounded-xl relative ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
                <Filter size={20} />
                {(filters.region || filters.hasShower || filters.hasPrayerRoom) && (
                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                )}
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative mb-3">
            <input 
                type="text" 
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full py-3 pl-10 pr-4 rounded-xl outline-none transition-all ${
                    isDark ? 'bg-gray-800 focus:bg-gray-700 text-white placeholder-gray-500' : 'bg-gray-100 focus:bg-white border border-transparent focus:border-blue-300 text-gray-900'
                }`}
            />
            <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
        </div>

        {/* Horizontal Category Scroll */}
        {currentView === 'home' && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
                onClick={() => setFilters({...filters, categoryId: null})}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.categoryId === null 
                    ? 'bg-blue-600 text-white' 
                    : isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600 border border-gray-200'
                }`}
            >
                {t('all')}
            </button>
            {CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setFilters({...filters, categoryId: cat.id})}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        filters.categoryId === cat.id 
                        ? 'bg-blue-600 text-white' 
                        : isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                >
                    {t('cat_' + cat.id) || cat.name}
                </button>
            ))}
            </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 pt-4">
        {currentView === 'home' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVenues.length > 0 ? (
                    filteredVenues.map(venue => (
                        <VenueCard 
                            key={venue.id} 
                            venue={venue} 
                            allCategories={CATEGORIES}
                            isDark={isDark}
                            isFavorite={userProfile.favorites.includes(venue.id)}
                            onToggleFavorite={(e) => toggleFavorite(e, venue.id)}
                            onShare={(e) => handleShareClick(e, venue)}
                            onClick={() => handleVenueClick(venue)}
                            lang={lang}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 text-gray-500">
                        {t('empty_search')}
                    </div>
                )}
            </div>
        )}

        {currentView === 'favorites' && (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <h2 className="col-span-full text-xl font-bold mb-2">{t('favorites')}</h2>
                {filteredVenues.length > 0 ? (
                    filteredVenues.map(venue => (
                        <VenueCard 
                            key={venue.id} 
                            venue={venue} 
                            allCategories={CATEGORIES}
                            isDark={isDark}
                            isFavorite={true}
                            onToggleFavorite={(e) => toggleFavorite(e, venue.id)}
                            onShare={(e) => handleShareClick(e, venue)}
                            onClick={() => handleVenueClick(venue)}
                            lang={lang}
                        />
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 opacity-60">
                        {t('empty_favorites')}
                    </div>
                )}
             </div>
        )}

        {currentView === 'map' && <MapView />}
        {currentView === 'profile' && <ProfileView />}
      </div>

      {/* Bottom Navigation (Mobile/Tablet Only) - ALWAYS VISIBLE with High Z-Index */}
      <div className={`fixed bottom-0 left-0 right-0 z-[60] px-6 py-3 flex justify-between items-center ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t safe-area-bottom md:hidden`}>
        <button 
            onClick={() => handleNavigation('home')}
            className={`flex flex-col items-center gap-1 ${currentView === 'home' ? 'text-blue-500' : 'text-gray-400'}`}
        >
            <Home size={24} fill={currentView === 'home' ? "currentColor" : "none"} />
            <span className="text-[10px] font-medium">{t('home')}</span>
        </button>
        <button 
            onClick={() => handleNavigation('favorites')}
            className={`flex flex-col items-center gap-1 ${currentView === 'favorites' ? 'text-blue-500' : 'text-gray-400'}`}
        >
            <Heart size={24} fill={currentView === 'favorites' ? "currentColor" : "none"} />
            <span className="text-[10px] font-medium">{t('favorites')}</span>
        </button>
        <button 
            onClick={() => handleNavigation('map')}
            className={`flex flex-col items-center gap-1 ${currentView === 'map' ? 'text-blue-500' : 'text-gray-400'}`}
        >
            <MapIcon size={24} fill={currentView === 'map' ? "currentColor" : "none"} />
            <span className="text-[10px] font-medium">{t('map')}</span>
        </button>
        <button 
            onClick={() => handleNavigation('profile')}
            className={`flex flex-col items-center gap-1 ${currentView === 'profile' ? 'text-blue-500' : 'text-gray-400'}`}
        >
            <User size={24} fill={currentView === 'profile' ? "currentColor" : "none"} />
            <span className="text-[10px] font-medium">{t('profile')}</span>
        </button>
      </div>

      {/* Modals */}
      {selectedVenue && (
        <VenueDetails 
            venue={selectedVenue} 
            categories={CATEGORIES}
            isDark={isDark} 
            onBack={() => setSelectedVenue(null)} 
            lang={lang}
        />
      )}

      <ShareModal 
        isOpen={!!sharingVenue}
        venue={sharingVenue}
        onClose={() => setSharingVenue(null)}
        isDark={isDark}
        lang={lang}
      />

      <FilterModal 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        isDark={isDark}
        categories={CATEGORIES}
        lang={lang}
      />
    </div>
  );
}

export default App;