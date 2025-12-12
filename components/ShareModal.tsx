
import React, { useState } from 'react';
import { X, Copy, Link, MessageCircle, Send, Video, Monitor } from 'lucide-react';
import { Venue, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ShareModalProps {
  venue: Venue | null;
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  lang: Language;
}

const ShareModal: React.FC<ShareModalProps> = ({ venue, isOpen, onClose, isDark, lang }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !venue) return null;

  const t = (key: string) => TRANSLATIONS[lang][key] || key;

  const venueLink = `${window.location.origin}/venue/${venue.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(venueLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: 'telegram' | 'whatsapp' | 'zoom' | 'meet') => {
    const text = `${venue.name}\n${venueLink}`;
    let url = '';

    switch (platform) {
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(venueLink)}&text=${encodeURIComponent(venue.name)}`;
        break;
      case 'whatsapp':
        url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        break;
      case 'zoom':
        // Simulating Zoom intent by copying link (no direct web share API for Zoom meeting creation from url)
        handleCopy();
        alert("Link copied! Paste it into your Zoom meeting invitation.");
        return;
      case 'meet':
        // Simulating Meet intent
        handleCopy();
        alert("Link copied! Paste it into your Google Meet invitation.");
        return;
    }
    
    if (url) window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-center items-end md:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className={`relative w-full max-w-md p-6 rounded-t-3xl md:rounded-3xl animate-slide-up md:animate-scale-in ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-2xl`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">{t('share')}</h3>
          <button onClick={onClose} className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}>
            <X size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl border mb-6 relative overflow-hidden group cursor-pointer" onClick={handleCopy}>
           <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
             <Link size={20} className="text-blue-500"/>
           </div>
           <div className="flex-1 truncate text-sm text-gray-500">
             {venueLink}
           </div>
           <button className="p-2 text-blue-500 font-medium text-sm">
             {copied ? t('link_copied') : t('copy_link')}
           </button>
        </div>

        <p className="text-sm font-medium text-gray-500 mb-4">{t('share_via')}</p>

        <div className="grid grid-cols-4 gap-4">
            <button onClick={() => handleShare('telegram')} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Send size={24} className="-ml-1 mt-0.5" />
                </div>
                <span className="text-xs font-medium">Telegram</span>
            </button>
            <button onClick={() => handleShare('whatsapp')} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <MessageCircle size={24} />
                </div>
                <span className="text-xs font-medium">WhatsApp</span>
            </button>
             <button onClick={() => handleShare('zoom')} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Video size={24} />
                </div>
                <span className="text-xs font-medium">Zoom</span>
            </button>
             <button onClick={() => handleShare('meet')} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Monitor size={24} />
                </div>
                <span className="text-xs font-medium">Meet</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
