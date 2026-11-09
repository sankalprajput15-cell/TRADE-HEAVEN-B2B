import { RfqRequirement, DetailedBuyerProfile, Incoterm } from '../types';

export interface WorldCountryMeta {
  id: string;
  name: string;
  code: string; // ISO 3166-1 alpha-2 uppercase
  flagEmoji: string;
  flagUrl: string;
  flagSvgUrl: string;
  region: 'Americas' | 'Europe' | 'Middle East & Africa' | 'Asia-Pacific';
  port: string;
}

export function codeToFlagEmoji(code: string): string {
  const clean = (code || 'UN').trim().toUpperCase();
  if (clean.length !== 2) return '🌐';
  return String.fromCodePoint(
    clean.charCodeAt(0) + 127397,
    clean.charCodeAt(1) + 127397
  );
}

const RAW_WORLD_COUNTRIES: Array<{
  code: string;
  name: string;
  region: 'Americas' | 'Europe' | 'Middle East & Africa' | 'Asia-Pacific';
  port: string;
}> = [
  { code: 'US', name: 'United States', region: 'Americas', port: 'Port of Houston / Los Angeles' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe', port: 'Port of Felixstowe / London Gateway' },
  { code: 'AE', name: 'United Arab Emirates', region: 'Middle East & Africa', port: 'Jebel Ali Port, Dubai' },
  { code: 'DE', name: 'Germany', region: 'Europe', port: 'Port of Hamburg / Bremerhaven' },
  { code: 'IN', name: 'India', region: 'Asia-Pacific', port: 'Nhava Sheva (JNPT) / Mundra Port' },
  { code: 'CN', name: 'China', region: 'Asia-Pacific', port: 'Port of Shanghai / Shenzhen' },
  { code: 'SA', name: 'Saudi Arabia', region: 'Middle East & Africa', port: 'Jeddah Islamic Port / Dammam' },
  { code: 'CA', name: 'Canada', region: 'Americas', port: 'Port of Vancouver / Montreal' },
  { code: 'AU', name: 'Australia', region: 'Asia-Pacific', port: 'Port of Melbourne / Sydney' },
  { code: 'NL', name: 'Netherlands', region: 'Europe', port: 'Port of Rotterdam' },
  { code: 'SG', name: 'Singapore', region: 'Asia-Pacific', port: 'Port of Singapore (PSA)' },
  { code: 'JP', name: 'Japan', region: 'Asia-Pacific', port: 'Port of Yokohama / Tokyo' },
  { code: 'KR', name: 'South Korea', region: 'Asia-Pacific', port: 'Port of Busan / Incheon' },
  { code: 'FR', name: 'France', region: 'Europe', port: 'Port of Le Havre / Marseille' },
  { code: 'IT', name: 'Italy', region: 'Europe', port: 'Port of Genoa / Gioia Tauro' },
  { code: 'ES', name: 'Spain', region: 'Europe', port: 'Port of Valencia / Algeciras' },
  { code: 'BR', name: 'Brazil', region: 'Americas', port: 'Port of Santos / Paranaguá' },
  { code: 'MX', name: 'Mexico', region: 'Americas', port: 'Port of Manzanillo / Veracruz' },
  { code: 'ZA', name: 'South Africa', region: 'Middle East & Africa', port: 'Port of Durban / Cape Town' },
  { code: 'TR', name: 'Republic of Türkiye', region: 'Europe', port: 'Port of Mersin / Ambarli' },
  { code: 'EG', name: 'Egypt', region: 'Middle East & Africa', port: 'Alexandria / Port Said' },
  { code: 'NG', name: 'Nigeria', region: 'Middle East & Africa', port: 'Apapa / Tin Can Island Port, Lagos' },
  { code: 'KE', name: 'Kenya', region: 'Middle East & Africa', port: 'Port of Mombasa' },
  { code: 'GH', name: 'Ghana', region: 'Middle East & Africa', port: 'Port of Tema' },
  { code: 'MA', name: 'Morocco', region: 'Middle East & Africa', port: 'Tanger-Med / Casablanca Port' },
  { code: 'DZ', name: 'Algeria', region: 'Middle East & Africa', port: 'Port of Algiers / Oran' },
  { code: 'TZ', name: 'Tanzania', region: 'Middle East & Africa', port: 'Port of Dar es Salaam' },
  { code: 'ET', name: 'Ethiopia', region: 'Middle East & Africa', port: 'Djibouti Corridor / Addis Dry Port' },
  { code: 'CI', name: 'Ivory Coast', region: 'Middle East & Africa', port: 'Port of Abidjan' },
  { code: 'SN', name: 'Senegal', region: 'Middle East & Africa', port: 'Port of Dakar' },
  { code: 'AO', name: 'Angola', region: 'Middle East & Africa', port: 'Port of Luanda' },
  { code: 'CM', name: 'Cameroon', region: 'Middle East & Africa', port: 'Port of Douala' },
  { code: 'UG', name: 'Uganda', region: 'Middle East & Africa', port: 'Kampala / Mombasa Transit' },
  { code: 'ZM', name: 'Zambia', region: 'Middle East & Africa', port: 'Lusaka / Beira Corridor' },
  { code: 'ZW', name: 'Zimbabwe', region: 'Middle East & Africa', port: 'Harare Industrial Hub' },
  { code: 'MU', name: 'Mauritius', region: 'Middle East & Africa', port: 'Port Louis' },
  { code: 'TN', name: 'Tunisia', region: 'Middle East & Africa', port: 'Port of Rades' },
  { code: 'LY', name: 'Libya', region: 'Middle East & Africa', port: 'Port of Misrata / Tripoli' },
  { code: 'JO', name: 'Jordan', region: 'Middle East & Africa', port: 'Port of Aqaba' },
  { code: 'LB', name: 'Lebanon', region: 'Middle East & Africa', port: 'Port of Beirut' },
  { code: 'IQ', name: 'Iraq', region: 'Middle East & Africa', port: 'Umm Qasr Port' },
  { code: 'KW', name: 'Kuwait', region: 'Middle East & Africa', port: 'Shuwaikh Port' },
  { code: 'QA', name: 'Qatar', region: 'Middle East & Africa', port: 'Hamad Port, Doha' },
  { code: 'OM', name: 'Oman', region: 'Middle East & Africa', port: 'Port of Sohar / Salalah' },
  { code: 'BH', name: 'Bahrain', region: 'Middle East & Africa', port: 'Khalifa Bin Salman Port' },
  { code: 'IL', name: 'Israel', region: 'Middle East & Africa', port: 'Port of Haifa / Ashdod' },
  { code: 'VN', name: 'Vietnam', region: 'Asia-Pacific', port: 'Cat Lai (HCMC) / Hai Phong Port' },
  { code: 'TH', name: 'Thailand', region: 'Asia-Pacific', port: 'Laem Chabang / Bangkok Port' },
  { code: 'ID', name: 'Indonesia', region: 'Asia-Pacific', port: 'Tanjung Priok (Jakarta) / Surabaya' },
  { code: 'MY', name: 'Malaysia', region: 'Asia-Pacific', port: 'Port Klang / Tanjung Pelepas' },
  { code: 'PH', name: 'Philippines', region: 'Asia-Pacific', port: 'Port of Manila / Cebu' },
  { code: 'PK', name: 'Pakistan', region: 'Asia-Pacific', port: 'Port of Karachi / Port Qasim' },
  { code: 'BD', name: 'Bangladesh', region: 'Asia-Pacific', port: 'Chittagong Port' },
  { code: 'LK', name: 'Sri Lanka', region: 'Asia-Pacific', port: 'Port of Colombo' },
  { code: 'NP', name: 'Nepal', region: 'Asia-Pacific', port: 'Birgunj Dry Port / Kolkata Transit' },
  { code: 'MM', name: 'Myanmar', region: 'Asia-Pacific', port: 'Port of Yangon' },
  { code: 'KH', name: 'Cambodia', region: 'Asia-Pacific', port: 'Sihanoukville Autonomous Port' },
  { code: 'TW', name: 'Taiwan', region: 'Asia-Pacific', port: 'Port of Kaohsiung / Keelung' },
  { code: 'HK', name: 'Hong Kong', region: 'Asia-Pacific', port: 'Kwai Tsing Container Terminals' },
  { code: 'NZ', name: 'New Zealand', region: 'Asia-Pacific', port: 'Port of Tauranga / Auckland' },
  { code: 'KZ', name: 'Kazakhstan', region: 'Asia-Pacific', port: 'Aktau Port / Almaty Rail Hub' },
  { code: 'UZ', name: 'Uzbekistan', region: 'Asia-Pacific', port: 'Tashkent Logistics Hub' },
  { code: 'AZ', name: 'Azerbaijan', region: 'Europe', port: 'Port of Baku' },
  { code: 'GE', name: 'Georgia', region: 'Europe', port: 'Port of Poti / Batumi' },
  { code: 'PL', name: 'Poland', region: 'Europe', port: 'Port of Gdansk / Gdynia' },
  { code: 'SE', name: 'Sweden', region: 'Europe', port: 'Port of Gothenburg' },
  { code: 'NO', name: 'Norway', region: 'Europe', port: 'Port of Oslo / Bergen' },
  { code: 'DK', name: 'Denmark', region: 'Europe', port: 'Port of Aarhus / Copenhagen' },
  { code: 'FI', name: 'Finland', region: 'Europe', port: 'Port of Helsinki / Kotka' },
  { code: 'BE', name: 'Belgium', region: 'Europe', port: 'Port of Antwerp-Bruges' },
  { code: 'CH', name: 'Switzerland', region: 'Europe', port: 'Basel Rhine Port / Zurich' },
  { code: 'AT', name: 'Austria', region: 'Europe', port: 'Port of Vienna' },
  { code: 'PT', name: 'Portugal', region: 'Europe', port: 'Port of Sines / Lisbon' },
  { code: 'GR', name: 'Greece', region: 'Europe', port: 'Port of Piraeus / Thessaloniki' },
  { code: 'IE', name: 'Ireland', region: 'Europe', port: 'Dublin Port / Cork' },
  { code: 'CZ', name: 'Czechia', region: 'Europe', port: 'Prague Logistics Terminal' },
  { code: 'RO', name: 'Romania', region: 'Europe', port: 'Port of Constanta' },
  { code: 'HU', name: 'Hungary', region: 'Europe', port: 'Budapest Csepel Freeport' },
  { code: 'BG', name: 'Bulgaria', region: 'Europe', port: 'Port of Varna / Burgas' },
  { code: 'UA', name: 'Ukraine', region: 'Europe', port: 'Port of Odesa' },
  { code: 'HR', name: 'Croatia', region: 'Europe', port: 'Port of Rijeka' },
  { code: 'RS', name: 'Serbia', region: 'Europe', port: 'Port of Belgrade' },
  { code: 'SK', name: 'Slovakia', region: 'Europe', port: 'Bratislava Port' },
  { code: 'SI', name: 'Slovenia', region: 'Europe', port: 'Port of Koper' },
  { code: 'LT', name: 'Lithuania', region: 'Europe', port: 'Port of Klaipeda' },
  { code: 'LV', name: 'Latvia', region: 'Europe', port: 'Freeport of Riga' },
  { code: 'EE', name: 'Estonia', region: 'Europe', port: 'Port of Tallinn' },
  { code: 'CY', name: 'Cyprus', region: 'Europe', port: 'Port of Limassol' },
  { code: 'MT', name: 'Malta', region: 'Europe', port: 'Malta Freeport' },
  { code: 'LU', name: 'Luxembourg', region: 'Europe', port: 'Luxembourg Cargo Hub' },
  { code: 'IS', name: 'Iceland', region: 'Europe', port: 'Port of Reykjavik' },
  { code: 'AR', name: 'Argentina', region: 'Americas', port: 'Port of Buenos Aires / Rosario' },
  { code: 'CL', name: 'Chile', region: 'Americas', port: 'Port of San Antonio / Valparaíso' },
  { code: 'CO', name: 'Colombia', region: 'Americas', port: 'Port of Cartagena / Buenaventura' },
  { code: 'PE', name: 'Peru', region: 'Americas', port: 'Port of Callao' },
  { code: 'EC', name: 'Ecuador', region: 'Americas', port: 'Port of Guayaquil' },
  { code: 'UY', name: 'Uruguay', region: 'Americas', port: 'Port of Montevideo' },
  { code: 'PY', name: 'Paraguay', region: 'Americas', port: 'Port of Asunción' },
  { code: 'BO', name: 'Bolivia', region: 'Americas', port: 'Santa Cruz / Arica Transit' },
  { code: 'VE', name: 'Venezuela', region: 'Americas', port: 'Puerto Cabello' },
  { code: 'PA', name: 'Panama', region: 'Americas', port: 'Port of Balboa / Colón Free Zone' },
  { code: 'CR', name: 'Costa Rica', region: 'Americas', port: 'Puerto Limón / Caldera' },
  { code: 'GT', name: 'Guatemala', region: 'Americas', port: 'Puerto Quetzal / Santo Tomás' },
  { code: 'DO', name: 'Dominican Republic', region: 'Americas', port: 'Port of Caucedo / Rio Haina' },
  { code: 'PR', name: 'Puerto Rico', region: 'Americas', port: 'Port of San Juan' },
  { code: 'JM', name: 'Jamaica', region: 'Americas', port: 'Port of Kingston' },
  { code: 'TT', name: 'Trinidad and Tobago', region: 'Americas', port: 'Port of Point Lisas' },
  { code: 'HN', name: 'Honduras', region: 'Americas', port: 'Puerto Cortés' },
  { code: 'SV', name: 'El Salvador', region: 'Americas', port: 'Port of Acajutla' },
  { code: 'NI', name: 'Nicaragua', region: 'Americas', port: 'Port of Corinto' },
  { code: 'BS', name: 'Bahamas', region: 'Americas', port: 'Freeport Container Port' },
  { code: 'BB', name: 'Barbados', region: 'Americas', port: 'Port of Bridgetown' },
  { code: 'GY', name: 'Guyana', region: 'Americas', port: 'Port of Georgetown' },
  { code: 'SR', name: 'Suriname', region: 'Americas', port: 'Port of Paramaribo' },
  { code: 'AF', name: 'Afghanistan', region: 'Asia-Pacific', port: 'Hairatan / Karachi Transit' },
  { code: 'AL', name: 'Albania', region: 'Europe', port: 'Port of Durrës' },
  { code: 'AD', name: 'Andorra', region: 'Europe', port: 'Andorra Dry Port' },
  { code: 'AG', name: 'Antigua and Barbuda', region: 'Americas', port: 'Saint John’s Port' },
  { code: 'AM', name: 'Armenia', region: 'Europe', port: 'Yerevan Terminal' },
  { code: 'BY', name: 'Belarus', region: 'Europe', port: 'Minsk Intermodal Hub' },
  { code: 'BZ', name: 'Belize', region: 'Americas', port: 'Port of Belize City' },
  { code: 'BJ', name: 'Benin', region: 'Middle East & Africa', port: 'Port of Cotonou' },
  { code: 'BT', name: 'Bhutan', region: 'Asia-Pacific', port: 'Phuentsholing Dry Port' },
  { code: 'BA', name: 'Bosnia and Herzegovina', region: 'Europe', port: 'Sarajevo / Ploče Corridor' },
  { code: 'BW', name: 'Botswana', region: 'Middle East & Africa', port: 'Gaborone Inland Port' },
  { code: 'BN', name: 'Brunei', region: 'Asia-Pacific', port: 'Muara Port' },
  { code: 'BF', name: 'Burkina Faso', region: 'Middle East & Africa', port: 'Ouagadougou Dry Port' },
  { code: 'BI', name: 'Burundi', region: 'Middle East & Africa', port: 'Port of Bujumbura' },
  { code: 'CV', name: 'Cabo Verde', region: 'Middle East & Africa', port: 'Porto Grande' },
  { code: 'CF', name: 'Central African Republic', region: 'Middle East & Africa', port: 'Bangui River Port' },
  { code: 'TD', name: 'Chad', region: 'Middle East & Africa', port: 'N’Djamena Logistics Hub' },
  { code: 'KM', name: 'Comoros', region: 'Middle East & Africa', port: 'Port of Moroni' },
  { code: 'CG', name: 'Republic of the Congo', region: 'Middle East & Africa', port: 'Port of Pointe-Noire' },
  { code: 'CD', name: 'DR Congo', region: 'Middle East & Africa', port: 'Port of Matadi / Lubumbashi' },
  { code: 'CU', name: 'Cuba', region: 'Americas', port: 'Port of Mariel / Havana' },
  { code: 'DJ', name: 'Djibouti', region: 'Middle East & Africa', port: 'Doraleh Container Terminal' },
  { code: 'DM', name: 'Dominica', region: 'Americas', port: 'Port of Roseau' },
  { code: 'GQ', name: 'Equatorial Guinea', region: 'Middle East & Africa', port: 'Port of Malabo / Bata' },
  { code: 'ER', name: 'Eritrea', region: 'Middle East & Africa', port: 'Port of Massawa' },
  { code: 'SZ', name: 'Eswatini', region: 'Middle East & Africa', port: 'Matsapha Dry Port' },
  { code: 'FJ', name: 'Fiji', region: 'Asia-Pacific', port: 'Port of Suva / Lautoka' },
  { code: 'GA', name: 'Gabon', region: 'Middle East & Africa', port: 'Port of Owendo (Libreville)' },
  { code: 'GM', name: 'Gambia', region: 'Middle East & Africa', port: 'Port of Banjul' },
  { code: 'GD', name: 'Grenada', region: 'Americas', port: 'Port of St. George’s' },
  { code: 'GN', name: 'Guinea', region: 'Middle East & Africa', port: 'Port of Conakry' },
  { code: 'GW', name: 'Guinea-Bissau', region: 'Middle East & Africa', port: 'Port of Bissau' },
  { code: 'HT', name: 'Haiti', region: 'Americas', port: 'Port-au-Prince' },
  { code: 'IR', name: 'Iran', region: 'Middle East & Africa', port: 'Bandar Abbas Port' },
  { code: 'KG', name: 'Kyrgyzstan', region: 'Asia-Pacific', port: 'Bishkek Free Economic Zone' },
  { code: 'LA', name: 'Laos', region: 'Asia-Pacific', port: 'Thanaleng Dry Port (Vientiane)' },
  { code: 'LS', name: 'Lesotho', region: 'Middle East & Africa', port: 'Maseru Logistics Hub' },
  { code: 'LR', name: 'Liberia', region: 'Middle East & Africa', port: 'Freeport of Monrovia' },
  { code: 'LI', name: 'Liechtenstein', region: 'Europe', port: 'Schaan Industrial Terminal' },
  { code: 'MG', name: 'Madagascar', region: 'Middle East & Africa', port: 'Port of Toamasina' },
  { code: 'MW', name: 'Malawi', region: 'Middle East & Africa', port: 'Lilongwe / Blantyre Hub' },
  { code: 'MV', name: 'Maldives', region: 'Asia-Pacific', port: 'Malé Commercial Harbour' },
  { code: 'ML', name: 'Mali', region: 'Middle East & Africa', port: 'Bamako Dry Port' },
  { code: 'MR', name: 'Mauritania', region: 'Middle East & Africa', port: 'Port of Nouakchott' },
  { code: 'MD', name: 'Moldova', region: 'Europe', port: 'Giurgiulesti International Free Port' },
  { code: 'MC', name: 'Monaco', region: 'Europe', port: 'Port Hercule' },
  { code: 'MN', name: 'Mongolia', region: 'Asia-Pacific', port: 'Ulaanbaatar Zamyn-Üüd Hub' },
  { code: 'ME', name: 'Montenegro', region: 'Europe', port: 'Port of Bar' },
  { code: 'MZ', name: 'Mozambique', region: 'Middle East & Africa', port: 'Port of Maputo / Beira' },
  { code: 'NA', name: 'Namibia', region: 'Middle East & Africa', port: 'Port of Walvis Bay' },
  { code: 'NE', name: 'Niger', region: 'Middle East & Africa', port: 'Niamey Dry Port' },
  { code: 'MK', name: 'North Macedonia', region: 'Europe', port: 'Skopje Intermodal Terminal' },
  { code: 'PG', name: 'Papua New Guinea', region: 'Asia-Pacific', port: 'Port of Lae / Port Moresby' },
  { code: 'RW', name: 'Rwanda', region: 'Middle East & Africa', port: 'Kigali Logistics Platform' },
  { code: 'WS', name: 'Samoa', region: 'Asia-Pacific', port: 'Port of Apia' },
  { code: 'SM', name: 'San Marino', region: 'Europe', port: 'San Marino Logistics Park' },
  { code: 'ST', name: 'Sao Tome and Principe', region: 'Middle East & Africa', port: 'Port of São Tomé' },
  { code: 'SC', name: 'Seychelles', region: 'Middle East & Africa', port: 'Port Victoria' },
  { code: 'SL', name: 'Sierra Leone', region: 'Middle East & Africa', port: 'Queen Elizabeth II Quay (Freetown)' },
  { code: 'SB', name: 'Solomon Islands', region: 'Asia-Pacific', port: 'Port of Honiara' },
  { code: 'SO', name: 'Somalia', region: 'Middle East & Africa', port: 'Port of Mogadishu / Berbera' },
  { code: 'SS', name: 'South Sudan', region: 'Middle East & Africa', port: 'Juba Logistics Hub' },
  { code: 'SD', name: 'Sudan', region: 'Middle East & Africa', port: 'Port Sudan' },
  { code: 'SY', name: 'Syria', region: 'Middle East & Africa', port: 'Port of Latakia' },
  { code: 'TJ', name: 'Tajikistan', region: 'Asia-Pacific', port: 'Dushanbe Rail Terminal' },
  { code: 'TL', name: 'Timor-Leste', region: 'Asia-Pacific', port: 'Tibar Bay Port' },
  { code: 'TG', name: 'Togo', region: 'Middle East & Africa', port: 'Port of Lomé' },
  { code: 'TO', name: 'Tonga', region: 'Asia-Pacific', port: 'Port of Nukuʻalofa' },
  { code: 'TM', name: 'Turkmenistan', region: 'Asia-Pacific', port: 'Turkmenbashi International Seaport' },
  { code: 'VU', name: 'Vanuatu', region: 'Asia-Pacific', port: 'Port Vila' },
  { code: 'YE', name: 'Yemen', region: 'Middle East & Africa', port: 'Port of Aden / Hodeidah' }
];

export const WORLD_COUNTRIES_LIST: WorldCountryMeta[] = RAW_WORLD_COUNTRIES.map(item => {
  const lower = item.code.toLowerCase();
  const slug =
    item.code === 'GB'
      ? 'uk'
      : item.code === 'US'
      ? 'usa'
      : item.code === 'AE'
      ? 'uae'
      : item.code === 'TR'
      ? 'turkiye'
      : item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return {
    id: slug,
    name: item.name,
    code: item.code,
    flagEmoji: codeToFlagEmoji(item.code),
    flagUrl: `https://flagcdn.com/w80/${lower}.png`,
    flagSvgUrl: `https://flagcdn.com/${lower}.svg`,
    region: item.region,
    port: item.port
  };
});

const COUNTRY_LOOKUP_CACHE = new Map<string, WorldCountryMeta>();

export function getCountryFlagInfo(countryNameOrCode?: string | null): WorldCountryMeta {
  const fallback = WORLD_COUNTRIES_LIST[0]; // US fallback
  if (!countryNameOrCode) return fallback;
  const raw = String(countryNameOrCode).trim();
  if (!raw) return fallback;

  const cached = COUNTRY_LOOKUP_CACHE.get(raw.toLowerCase());
  if (cached) return cached;

  const norm = raw.toLowerCase();

  // Direct ISO-2 match
  if (norm.length === 2) {
    const byCode = WORLD_COUNTRIES_LIST.find(c => c.code.toLowerCase() === norm);
    if (byCode) {
      COUNTRY_LOOKUP_CACHE.set(norm, byCode);
      return byCode;
    }
  }

  // Common aliases
  if (norm.includes('united states') || norm === 'usa' || norm === 'u.s.a.' || norm.startsWith('usa ') || norm.includes(', usa')) {
    const us = WORLD_COUNTRIES_LIST.find(c => c.code === 'US')!;
    COUNTRY_LOOKUP_CACHE.set(norm, us);
    return us;
  }
  if (norm.includes('united kingdom') || norm === 'uk' || norm.includes('britain') || norm.includes('england') || norm.includes('london')) {
    const uk = WORLD_COUNTRIES_LIST.find(c => c.code === 'GB')!;
    COUNTRY_LOOKUP_CACHE.set(norm, uk);
    return uk;
  }
  if (norm.includes('arab emirates') || norm === 'uae' || norm.includes('dubai') || norm.includes('abu dhabi') || norm.includes('jebel ali')) {
    const uae = WORLD_COUNTRIES_LIST.find(c => c.code === 'AE')!;
    COUNTRY_LOOKUP_CACHE.set(norm, uae);
    return uae;
  }
  if (norm.includes('türkiye') || norm.includes('turkey') || norm.includes('turkiye') || norm.includes('mersin') || norm.includes('istanbul')) {
    const tr = WORLD_COUNTRIES_LIST.find(c => c.code === 'TR')!;
    COUNTRY_LOOKUP_CACHE.set(norm, tr);
    return tr;
  }
  if (norm.includes('south korea') || norm === 'korea' || norm.includes('busan') || norm.includes('seoul')) {
    const kr = WORLD_COUNTRIES_LIST.find(c => c.code === 'KR')!;
    COUNTRY_LOOKUP_CACHE.set(norm, kr);
    return kr;
  }
  if (norm.includes('czech')) {
    const cz = WORLD_COUNTRIES_LIST.find(c => c.code === 'CZ')!;
    COUNTRY_LOOKUP_CACHE.set(norm, cz);
    return cz;
  }
  if (norm.includes('ivory coast') || norm.includes('cote d')) {
    const ci = WORLD_COUNTRIES_LIST.find(c => c.code === 'CI')!;
    COUNTRY_LOOKUP_CACHE.set(norm, ci);
    return ci;
  }

  // Exact or substring match against country names
  const exact = WORLD_COUNTRIES_LIST.find(
    c => c.name.toLowerCase() === norm || c.id.toLowerCase() === norm
  );
  if (exact) {
    COUNTRY_LOOKUP_CACHE.set(norm, exact);
    return exact;
  }

  const partial = WORLD_COUNTRIES_LIST.find(
    c => norm.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(norm)
  );
  if (partial) {
    COUNTRY_LOOKUP_CACHE.set(norm, partial);
    return partial;
  }

  return {
    id: norm.replace(/[^a-z0-9]+/g, '-'),
    name: raw.split('-')[0].trim() || 'Global',
    code: 'UN',
    flagEmoji: '🌐',
    flagUrl: 'https://flagcdn.com/w80/un.png',
    flagSvgUrl: 'https://flagcdn.com/un.svg',
    region: 'Europe',
    port: 'International Port'
  };
}

interface CommodityTemplate {
  productName: string;
  category: string;
  unit: string;
  quantities: number[];
  priceUsd: number;
  image: string;
  specs: string;
}

const GO4WORLD_COMMODITIES: CommodityTemplate[] = [
  {
    productName: '1121 Extra Long Grain Steam Basmati Rice',
    category: 'Agriculture & Food Beverage',
    unit: 'MT',
    quantities: [100, 250, 500, 1000, 2500],
    priceUsd: 940,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    specs: '8.35mm average grain length, max 1% broken, double silky sortex cleaned, packed in 25kg/50kg PP non-woven bags.'
  },
  {
    productName: 'ICUMSA 45 Refined White Cane Sugar',
    category: 'Agriculture & Food Beverage',
    unit: 'MT',
    quantities: [500, 1500, 5000, 12500, 25000],
    priceUsd: 465,
    image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=800&auto=format&fit=crop&q=80',
    specs: 'Polarization 99.80% min, moisture 0.04% max, ash content 0.04% max, 100% water soluble, SGS certified.'
  },
  {
    productName: 'Refined Sunflower Cooking Oil (1L, 5L & 20L PET)',
    category: 'Agriculture & Food Beverage',
    unit: 'MT',
    quantities: [80, 200, 450, 1000],
    priceUsd: 980,
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80',
    specs: '100% pure Winterized Refined Deodorized Sunflower Oil, Vitamin A & D enriched, private label OEM packaging required.'
  },
  {
    productName: 'Electrolytic Copper Cathodes Grade A 99.99%',
    category: 'Metals, Minerals & Energy',
    unit: 'MT',
    quantities: [200, 500, 1000, 3000],
    priceUsd: 8650,
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    specs: 'LME Grade A standard Cu 99.99% min, dimensions 914mm x 914mm x 12mm, palletized and banded with SGS assay certificate.'
  },
  {
    productName: 'Automotive Diesel Fuel EN590 10PPM ULSD',
    category: 'Metals, Minerals & Energy',
    unit: 'MT',
    quantities: [10000, 25000, 50000, 100000],
    priceUsd: 615,
    image: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80',
    specs: 'Ultra-Low Sulfur Diesel max 10ppm sulfur, density 0.820-0.845 kg/L at 15°C, dip test & SGS inspection at discharge port.'
  },
  {
    productName: 'Urea 46% Prilled & Granular Agricultural Fertilizer',
    category: 'Chemicals & Plastics',
    unit: 'MT',
    quantities: [1000, 5000, 12500, 25000],
    priceUsd: 335,
    image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=800&auto=format&fit=crop&q=80',
    specs: 'Nitrogen 46.0% min, Biuret 1.0% max, moisture 0.5% max, free flowing anti-caking treated, 50kg PP woven bags with PE liner.'
  },
  {
    productName: 'Millberry Copper Wire Scrap 99.95% Bare Bright',
    category: 'Metals, Minerals & Energy',
    unit: 'MT',
    quantities: [40, 100, 250, 500],
    priceUsd: 7450,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80',
    specs: 'Clean unalloyed bare bright copper wire scrap, wire diameter 1.0mm-3.0mm, free of insulation, oil, and oxidation.'
  },
  {
    productName: 'Raw Cashew Nuts W320 & W240 Export Kernels',
    category: 'Agriculture & Food Beverage',
    unit: 'MT',
    quantities: [20, 50, 100, 240],
    priceUsd: 6200,
    image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=800&auto=format&fit=crop&q=80',
    specs: 'New crop vacuum-packed in 2x10kg tins per carton or 22.68kg flexi pouches flushed with CO2/Nitrogen, moisture <5%.'
  },
  {
    productName: '550W Monocrystalline Bifacial Solar PV Panels',
    category: 'Electronics & Electrical',
    unit: 'Units',
    quantities: [1000, 2500, 5000, 10000],
    priceUsd: 68,
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&auto=format&fit=crop&q=80',
    specs: 'Tier-1 N-Type TOPCon half-cut cells, 22.4% efficiency, IP68 junction box, TUV/CE/IEC 61215 certified, 25-year warranty.'
  },
  {
    productName: 'A4 Copy Paper 80 GSM 100% Virgin Wood Pulp',
    category: 'Packaging & Office Supplies',
    unit: 'Reams',
    quantities: [8000, 16000, 32000, 80000],
    priceUsd: 1.95,
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80',
    specs: '210mm x 297mm international A4 size, 102-104% brightness, 500 sheets per ream, 5 reams per box, jam-free high speed.'
  },
  {
    productName: 'Aluminum Ingots A7 99.7% Primary Purity',
    category: 'Metals, Minerals & Energy',
    unit: 'MT',
    quantities: [100, 300, 1000, 2500],
    priceUsd: 2380,
    image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80',
    specs: 'Al 99.70% min, Fe 0.20% max, Si 0.10% max, 20kg/25kg standard ingots strapped on fumigated wooden pallets.'
  },
  {
    productName: 'Yellow Corn Maize Grade #2 (Human & Animal Feed)',
    category: 'Agriculture & Food Beverage',
    unit: 'MT',
    quantities: [500, 2000, 10000, 25000],
    priceUsd: 215,
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80',
    specs: 'Moisture 14% max, protein 8.5% min, aflatoxin <20 ppb, broken kernels 3% max, non-GMO & GMO options accepted.'
  },
  {
    productName: 'Portland Cement OPC 42.5N / 42.5R Bulk & 50kg Bags',
    category: 'Construction & Building Materials',
    unit: 'MT',
    quantities: [1000, 5000, 15000, 30000],
    priceUsd: 54,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
    specs: 'EN 197-1 / ASTM C150 standard Ordinary Portland Cement, packed in 50kg 3-ply kraft + PP woven sling bags.'
  },
  {
    productName: 'Heavy Duty Hydraulic Crawler Excavator 20-Ton Class',
    category: 'Industrial Machinery',
    unit: 'Units',
    quantities: [4, 10, 20, 35],
    priceUsd: 48500,
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    specs: 'Operating weight 21,500 kg, bucket capacity 1.0 m³, Euro Stage V / Tier 4 turbo diesel engine, full spare parts kit.'
  },
  {
    productName: '100% Combed Ring-Spun Organic Cotton T-Shirts & Polo Apparel',
    category: 'Apparel, Textiles & Accessories',
    unit: 'Pieces',
    quantities: [5000, 15000, 30000, 50000],
    priceUsd: 3.4,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    specs: '180-220 GSM 100% combed cotton, reactive dyed, pre-shrunk, OEKO-TEX Standard 100 certified, custom woven neck labels.'
  },
  {
    productName: 'Virgin HDPE & LLDPE Film Grade Plastic Resin Granules',
    category: 'Chemicals & Plastics',
    unit: 'MT',
    quantities: [100, 250, 500, 1200],
    priceUsd: 1090,
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80',
    specs: 'Melt Flow Index (MFI) 1.0-2.0 g/10min, density 0.918-0.954 g/cm³, natural translucent pellets in 25kg heavy-duty bags.'
  },
  {
    productName: 'IQF Frozen Black Tiger Prawns & Vannamei White Shrimp',
    category: 'Agriculture & Food Beverage',
    unit: 'MT',
    quantities: [24, 48, 100, 200],
    priceUsd: 5900,
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800&auto=format&fit=crop&q=80',
    specs: 'HLSO / PDTO sizes 16/20 & 21/25, max 10% protective glaze, HACCP/BRC/EU approved plant, 40ft reefer container at -18°C.'
  },
  {
    productName: 'Radial Truck & Bus Tires (TBR 315/80R22.5 & 12.00R20)',
    category: 'Automotive & Transport',
    unit: 'Units',
    quantities: [500, 1200, 3000, 6000],
    priceUsd: 118,
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=800&auto=format&fit=crop&q=80',
    specs: '18PR/20PR heavy load index, all-steel radial carcass, ECE/DOT/GCC/SONCAP certified, high mileage tread compound.'
  },
  {
    productName: 'Lithium Iron Phosphate (LiFePO4) 51.2V 200Ah Energy Storage Packs',
    category: 'Electronics & Electrical',
    unit: 'Units',
    quantities: [100, 300, 800, 2000],
    priceUsd: 890,
    image: 'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?w=800&auto=format&fit=crop&q=80',
    specs: '10.24kWh rack/wall-mounted solar battery bank, Grade-A prismatic cells, 6000+ cycles @ 80% DoD, RS485/CAN BMS.'
  },
  {
    productName: 'Bourbon Grade A Gourmet Black Vanilla Beans (16cm-20cm)',
    category: 'Agriculture & Food Beverage',
    unit: 'Kg',
    quantities: [250, 500, 1000, 2500],
    priceUsd: 145,
    image: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?w=800&auto=format&fit=crop&q=80',
    specs: 'Vanillin content 1.8%-2.4%, moisture 30%-35%, supple non-split pods, vacuum-sealed in 1kg food-grade pouches.'
  }
];

const BUYER_COMPANY_PREFIXES = [
  'Global', 'Apex', 'Continental', 'Vanguard', 'Prime', 'Meridian', 'Pacific', 'Atlantic',
  'Sovereign', 'Imperial', 'Nexus', 'Horizon', 'Sterling', 'Atlas', 'Zenith', 'OmniTrade',
  'EuroAsia', 'TransWorld', 'FirstNational', 'Delta', 'Summit', 'Crown', 'Alpha', 'Crescent'
];

const BUYER_COMPANY_SUFFIXES = [
  'Import & Export Corp.', 'Commodities Trading Ltd.', 'Wholesale Distribution Group',
  'Procurement & Logistics LLC', 'Industrial Supply Co.', 'Agro & Food Importers Inc.',
  'Mercantile Holdings S.A.', 'Global Sourcing GmbH', 'International Ventures PLC',
  'Supply Chain Partners Pty Ltd.'
];

const BUYER_FIRST_NAMES = [
  'Alexander', 'Tariq', 'Carlos', 'Hiroshi', 'Lukas', 'Jean-Pierre', 'Matteo', 'Kwame',
  'Ibrahim', 'Vikram', 'Sebastian', 'Henrik', 'Fernando', 'Andrei', 'Youssef', 'Daniel',
  'Samuel', 'Kofi', 'Mustafa', 'David', 'amara', 'Elena', 'Sofia', 'Fatima', 'Chidinma',
  'Nadia', 'Mei-Ling', 'Camila', 'Ingrid', 'Katarina'
];

const BUYER_LAST_NAMES = [
  'Vance', 'Al-Mansoor', 'Mendoza', 'Takahashi', 'Weber', 'Laurent', 'Rossi', 'Mensah',
  'El-Sayed', 'Malhotra', 'Lindqvist', 'Silva', 'Kowalski', 'Okafor', 'Haddad', 'Novak',
  'Van Der Berg', 'Fernandez', 'Petrov', 'Abdi', 'Ndlovu', 'Kim', 'Santoso', 'Rahman'
];

const PAYMENT_TERMS_LIST = [
  '100% Irrevocable L/C at Sight (MT700)',
  '30% T/T Advance + 70% Against B/L Copy',
  'Documentary Letter of Credit (DLC) + SGS Inspection',
  'Trade Heaven 100% Escrow Trade Protection',
  'SBLC MT760 / 100% TT Against SGS Dip Test'
];

const INCOTERMS_LIST: Incoterm[] = ['CIF', 'FOB', 'CFR', 'DDP', 'CIP'];

/**
 * Generates deterministic or seeded Go4WorldBusiness-style Global Buy Orders
 * covering countries across the entire world with flags and realistic B2B inquiry copy.
 */
export function generateRandomGo4WorldBuyOrders(count = 72, seedOffset = 0): RfqRequirement[] {
  const results: RfqRequirement[] = [];
  const totalCountries = WORLD_COUNTRIES_LIST.length;

  for (let i = 0; i < count; i++) {
    const idx = i + seedOffset;
    const country = WORLD_COUNTRIES_LIST[(idx * 3 + 1) % totalCountries];
    const commodity = GO4WORLD_COMMODITIES[idx % GO4WORLD_COMMODITIES.length];
    const qty = commodity.quantities[idx % commodity.quantities.length];
    const incoterm = INCOTERMS_LIST[idx % INCOTERMS_LIST.length];
    const paymentTerm = PAYMENT_TERMS_LIST[idx % PAYMENT_TERMS_LIST.length];

    const firstName = BUYER_FIRST_NAMES[(idx * 5) % BUYER_FIRST_NAMES.length];
    const lastName = BUYER_LAST_NAMES[(idx * 7) % BUYER_LAST_NAMES.length];
    const buyerName = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName}`;

    const prefix = BUYER_COMPANY_PREFIXES[(idx * 11) % BUYER_COMPANY_PREFIXES.length];
    const suffix = BUYER_COMPANY_SUFFIXES[(idx * 13) % BUYER_COMPANY_SUFFIXES.length];
    const buyerCompany = `${country.name} ${prefix} ${suffix}`;

    const cleanComp = buyerCompany.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 22);
    const cleanPerson = `${firstName}.${lastName}`.toLowerCase().replace(/[^a-z.]/g, '');

    const daysAgo = idx % 9;
    const d = new Date(Date.now() - daysAgo * 86400000);
    const postedDate = d.toISOString().split('T')[0];
    const exp = new Date(Date.now() + (30 + (idx % 45)) * 86400000).toISOString().split('T')[0];

    const priceVariance = 1 + (((idx % 7) - 3) * 0.025);
    const targetPriceUsd = Number((commodity.priceUsd * priceVariance).toFixed(2));

    results.push({
      id: `G4W-BUY-${202600 + idx}-${country.code}`,
      title: `WANTED: ${qty.toLocaleString()} ${commodity.unit} ${commodity.productName} (${incoterm} ${country.port})`,
      productName: `WANTED : ${commodity.productName}`,
      category: commodity.category,
      targetQuantity: qty,
      quantityUnit: commodity.unit,
      targetPriceUsd,
      preferredIncoterm: incoterm,
      destinationPort: `${country.port}, ${country.name}`,
      destinationCountry: country.name,
      paymentTerms: paymentTerm,
      detailedRequirements: `Buyer from ${country.name} (${country.code}) is actively sourcing ${qty.toLocaleString()} ${commodity.unit} of ${commodity.productName}. Delivery required to ${country.port} under ${incoterm} terms. ${commodity.specs}`,
      detailedDescription: `[Verified ${country.name} Buyer Inquiry] Dear Sir/Madam, We are an established importing house in ${country.name} looking for reliable manufacturers and direct exporters of ${commodity.productName}. Required volume: ${qty.toLocaleString()} ${commodity.unit} (${incoterm} ${country.port}). ${commodity.specs} Payment via ${paymentTerm}. Please send your official FCO / Proforma quotation with past B/L track record and SGS certificates.`,
      image: commodity.image,
      images: [commodity.image],
      urgency: idx % 3 === 0 ? 'URGENT' : idx % 3 === 1 ? 'LONG_TERM_CONTRACT' : 'STANDARD',
      status: 'OPEN',
      buyerId: `buyer-g4w-${country.code.toLowerCase()}-${idx}`,
      buyerName,
      buyerCompany,
      buyerCountry: country.name,
      buyerEmail: `${cleanPerson}@${cleanComp}.com`,
      buyerPhone: `+${10 + (idx % 89)}-${200 + ((idx * 19) % 700)}-${1000 + ((idx * 37) % 8999)}`,
      buyerVerified: true,
      quotesCount: (idx % 11) + 2,
      viewsCount: 140 + ((idx * 29) % 820),
      postedDate,
      expiryDate: exp
    });
  }

  return results;
}

export const GO4WORLD_STYLE_BUY_ORDERS: RfqRequirement[] = generateRandomGo4WorldBuyOrders(80, 0);

export function generateRandomGo4WorldBuyers(count = 48, seedOffset = 0): DetailedBuyerProfile[] {
  const buyers: DetailedBuyerProfile[] = [];
  const totalCountries = WORLD_COUNTRIES_LIST.length;
  const tiers: Array<'VIP' | 'GOLD' | 'VERIFIED_BUYER'> = ['VIP', 'GOLD', 'VERIFIED_BUYER'];

  for (let i = 0; i < count; i++) {
    const idx = i + seedOffset;
    const country = WORLD_COUNTRIES_LIST[(idx * 4 + 2) % totalCountries];
    const c1 = GO4WORLD_COMMODITIES[idx % GO4WORLD_COMMODITIES.length];
    const c2 = GO4WORLD_COMMODITIES[(idx + 5) % GO4WORLD_COMMODITIES.length];

    const firstName = BUYER_FIRST_NAMES[(idx * 3) % BUYER_FIRST_NAMES.length];
    const lastName = BUYER_LAST_NAMES[(idx * 9) % BUYER_LAST_NAMES.length];
    const contactPerson = `${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName}`;

    const prefix = BUYER_COMPANY_PREFIXES[(idx * 7) % BUYER_COMPANY_PREFIXES.length];
    const suffix = BUYER_COMPANY_SUFFIXES[(idx * 5) % BUYER_COMPANY_SUFFIXES.length];
    const companyName = `${country.name} ${prefix} ${suffix}`;
    const cleanComp = companyName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 22);

    buyers.push({
      id: `buyer-g4w-${country.code.toLowerCase()}-${idx}`,
      companyName,
      legalRegistrationNumber: `REG-${country.code}-${480100 + idx}`,
      country: country.name,
      city: country.port.split('/')[0].replace('Port of ', '').trim(),
      address: `${country.port}, ${country.name}`,
      establishedYear: 2002 + (idx % 21),
      businessType: idx % 2 === 0 ? 'Corporate Importer' : 'Wholesale Distributor',
      tier: tiers[idx % tiers.length] as any,
      isVerifiedKYC: true,
      trustScore: 91 + (idx % 9),
      responseRate: `${94 + (idx % 6)}%`,
      avgResponseTime: '< 2 hours',
      totalEmployees: idx % 2 === 0 ? '51-200' : '201-500',
      annualPurchasingVolumeUsd: `$${5 + (idx % 45)}M - $${15 + (idx % 80)}M`,
      tradeAssuranceEscrowSecuredUsd: (250 + (idx % 12) * 100) * 1000,
      targetCategories: [c1.productName, c2.productName, c1.category],
      mainMarkets: [country.region, country.name, 'Global'],
      contactPerson,
      contactDesignation: 'Head of International Procurement',
      contactEmail: `procurement@${cleanComp}.com`,
      contactPhone: `+${10 + (idx % 89)}-${300 + ((idx * 23) % 600)}-${1000 + ((idx * 41) % 8999)}`,
      activeRfqsCount: 3 + (idx % 9),
      completedImportsCount: 18 + (idx % 64),
      description: `Verified ${country.name} (${country.code}) B2B Buyer & Importer actively purchasing ${c1.productName} and ${c2.productName} for national distribution via ${country.port}.`,
      logoUrl: c1.image,
      bannerUrl: c2.image
    });
  }

  return buyers;
}

export const GO4WORLD_STYLE_BUYERS: DetailedBuyerProfile[] = generateRandomGo4WorldBuyers(60, 0);
