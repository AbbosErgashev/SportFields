
export type CategoryType = 
  | 'TEAM' 
  | 'WATER' 
  | 'WINTER' 
  | 'COMBAT' 
  | 'ATHLETICS' 
  | 'SHOOTING' 
  | 'RACKET' 
  | 'EXTREME' 
  | 'FITNESS' 
  | 'EQUESTRIAN'
  | 'REHAB';

export type Language = 'uz' | 'ru' | 'en';

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon?: string;
}

export interface Location {
  lat: number;
  lng: number;
  region: string;
  district: string;
  address: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  categories: string[]; // Category IDs
  images: string[];
  rating: number;
  reviewCount: number;
  location: Location;
  pricePerHour: number;
  currency: string;
  hasInstallment: boolean; // Bo'lib to'lash
  amenities: {
    parking: boolean;
    changingRoom: boolean;
    shower: boolean;
    prayerRoom: boolean; // Namozxona
    equipmentRental: boolean;
    lighting: boolean;
  };
  contact: {
    phone: string[];
    telegram?: string;
    instagram?: string;
    whatsapp?: string;
  };
  workingHours: string;
  isOpenNow: boolean;
  reviews: Review[];
  createdAt: string;
}

export interface FilterState {
  categoryId: string | null;
  region: string | null;
  district: string | null;
  hasShower: boolean;
  hasPrayerRoom: boolean;
  hasEquipmentRental: boolean;
  hasInstallment: boolean;
  onlyOpen: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  favorites: string[]; // Venue IDs
  contactHistory: string[];
  myReviews: string[];
}