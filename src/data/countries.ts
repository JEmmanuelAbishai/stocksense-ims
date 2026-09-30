export interface CountryConfig {
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string;
  currencyName: string;
  flag: string;
}

export const COUNTRIES: CountryConfig[] = [
  { code: 'US', name: 'United States', currencyCode: 'USD', currencySymbol: '$', currencyName: 'US Dollar ($)', flag: '🇺🇸' },
  { code: 'IN', name: 'India', currencyCode: 'INR', currencySymbol: '₹', currencyName: 'Indian Rupee (₹)', flag: '🇮🇳' },
  { code: 'GB', name: 'United Kingdom', currencyCode: 'GBP', currencySymbol: '£', currencyName: 'British Pound (£)', flag: '🇬🇧' },
  { code: 'EU', name: 'Germany / France (EU)', currencyCode: 'EUR', currencySymbol: '€', currencyName: 'Euro (€)', flag: '🇪🇺' },
  { code: 'CA', name: 'Canada', currencyCode: 'CAD', currencySymbol: 'CA$', currencyName: 'Canadian Dollar (CA$)', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', currencyCode: 'AUD', currencySymbol: 'A$', currencyName: 'Australian Dollar (A$)', flag: '🇦🇺' },
  { code: 'JP', name: 'Japan', currencyCode: 'JPY', currencySymbol: '¥', currencyName: 'Japanese Yen (¥)', flag: '🇯🇵' },
  { code: 'SG', name: 'Singapore', currencyCode: 'SGD', currencySymbol: 'S$', currencyName: 'Singapore Dollar (S$)', flag: '🇸🇬' },
  { code: 'AE', name: 'United Arab Emirates', currencyCode: 'AED', currencySymbol: 'AED ', currencyName: 'UAE Dirham (AED)', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', currencyCode: 'SAR', currencySymbol: 'SAR ', currencyName: 'Saudi Riyal (SAR)', flag: '🇸🇦' },
  { code: 'CH', name: 'Switzerland', currencyCode: 'CHF', currencySymbol: 'CHF ', currencyName: 'Swiss Franc (CHF)', flag: '🇨🇭' },
  { code: 'CN', name: 'China', currencyCode: 'CNY', currencySymbol: '¥', currencyName: 'Chinese Yuan (¥)', flag: '🇨🇳' },
  { code: 'BR', name: 'Brazil', currencyCode: 'BRL', currencySymbol: 'R$', currencyName: 'Brazilian Real (R$)', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', currencyCode: 'MXN', currencySymbol: 'MX$', currencyName: 'Mexican Peso (MX$)', flag: '🇲🇽' },
  { code: 'ZA', name: 'South Africa', currencyCode: 'ZAR', currencySymbol: 'R ', currencyName: 'South African Rand (R)', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', currencyCode: 'NGN', currencySymbol: '₦', currencyName: 'Nigerian Naira (₦)', flag: '🇳🇬' },
  { code: 'PH', name: 'Philippines', currencyCode: 'PHP', currencySymbol: '₱', currencyName: 'Philippine Peso (₱)', flag: '🇵🇭' },
  { code: 'ID', name: 'Indonesia', currencyCode: 'IDR', currencySymbol: 'Rp ', currencyName: 'Indonesian Rupiah (Rp)', flag: '🇮🇩' },
  { code: 'KR', name: 'South Korea', currencyCode: 'KRW', currencySymbol: '₩', currencyName: 'South Korean Won (₩)', flag: '🇰🇷' },
  { code: 'NZ', name: 'New Zealand', currencyCode: 'NZD', currencySymbol: 'NZ$', currencyName: 'New Zealand Dollar (NZ$)', flag: '🇳🇿' },
];

export const getCountryByCode = (code?: string): CountryConfig => {
  if (!code) return COUNTRIES[0];
  return COUNTRIES.find(c => c.code.toUpperCase() === code.toUpperCase()) || COUNTRIES[0];
};

export const getCountryByName = (name?: string): CountryConfig => {
  if (!name) return COUNTRIES[0];
  const clean = name.toLowerCase();
  return COUNTRIES.find(c => c.name.toLowerCase().includes(clean)) || COUNTRIES[0];
};
