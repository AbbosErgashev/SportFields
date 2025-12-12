
import React from 'react';
import { X, Check, RotateCcw } from 'lucide-react';
import { FilterState, Category, Language } from '../types';
import { REGIONS, TRANSLATIONS } from '../constants';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  isDark: boolean;
  categories: Category[];
  lang: Language;
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, filters, setFilters, isDark, categories, lang }) => {
  if (!isOpen) return null;

  const t = (key: string) => TRANSLATIONS[lang][key] || key;

  const handleToggle = (key: keyof FilterState) => {
    setFilters({ ...filters, [key]: !filters[key] });
  };

  const handleRegionChange = (region: string) => {
      setFilters({ ...filters, region: region === filters.region ? null : region, district: null });
  };

  const handleDistrictChange = (district: string) => {
      setFilters({ ...filters, district: district === filters.district ? null : district });
  };

  const handleReset = () => {
    setFilters({
      categoryId: null,
      region: null,
      district: null,
      hasShower: false,
      hasPrayerRoom: false,
      hasEquipmentRental: false,
      hasInstallment: false,
      onlyOpen: false,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`relative w-full max-w-md h-full overflow-y-auto p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} shadow-xl animate-slide-in`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{t('filter')}</h2>
          <div className="flex items-center gap-2">
            <button 
                onClick={handleReset}
                className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
                <RotateCcw size={16} />
                {t('reset')}
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={24} />
            </button>
          </div>
        </div>

        {/* Region & District */}
        <div className="mb-8">
            <h3 className="font-semibold mb-3 text-lg">{t('region')}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(REGIONS).map(region => (
                    <button
                        key={region}
                        onClick={() => handleRegionChange(region)}
                        className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${
                            filters.region === region
                                ? 'bg-blue-600 text-white border-blue-600'
                                : isDark ? 'border-gray-700 hover:border-gray-500' : 'border-gray-200 hover:border-gray-400'
                        }`}
                    >
                        {region}
                    </button>
                ))}
            </div>
            
            {filters.region && (
                <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h4 className="text-sm font-medium mb-2 text-gray-500">{t('districts')} ({filters.region})</h4>
                    <div className="flex flex-wrap gap-2">
                        {REGIONS[filters.region].map(district => (
                            <button
                                key={district}
                                onClick={() => handleDistrictChange(district)}
                                className={`px-3 py-1 rounded-md text-sm border transition-all ${
                                    filters.district === district
                                        ? 'bg-blue-500/20 text-blue-600 border-blue-500'
                                        : isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'
                                }`}
                            >
                                {district}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Amenities */}
        <div className="mb-8">
            <h3 className="font-semibold mb-3 text-lg">{t('amenities')}</h3>
            <div className="space-y-3">
                {[
                    { key: 'hasPrayerRoom', label: t('filter_prayer') },
                    { key: 'hasShower', label: t('filter_shower') },
                    { key: 'hasEquipmentRental', label: t('filter_equipment') },
                    { key: 'hasInstallment', label: t('filter_installment') },
                    { key: 'onlyOpen', label: t('filter_open') },
                ].map((item) => (
                    <div 
                        key={item.key}
                        onClick={() => handleToggle(item.key as keyof FilterState)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                            filters[item.key as keyof FilterState]
                                ? isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
                                : isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        <span>{item.label}</span>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${
                             filters[item.key as keyof FilterState] ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                        }`}>
                            {filters[item.key as keyof FilterState] && <Check size={14} className="text-white" />}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Categories (Vertical List for detailed selection) */}
        <div className="mb-20">
             <h3 className="font-semibold mb-3 text-lg">{t('sport_type')}</h3>
             <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setFilters({...filters, categoryId: filters.categoryId === cat.id ? null : cat.id})}
                        className={`text-left px-3 py-2 rounded-lg text-sm border transition-all truncate ${
                            filters.categoryId === cat.id
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : isDark ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'
                        }`}
                    >
                        {t('cat_' + cat.id) || cat.name}
                    </button>
                ))}
             </div>
        </div>
        
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100'}`}>
            <button 
                onClick={onClose}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
                {t('show_results')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;