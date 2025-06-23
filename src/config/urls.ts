// Arquivo central de URLs do sistema

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://192.68.168.116:8080/casa-api/';

export const API_URLS = {
  CEARA: 'https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=4351&s=2025',
  FIPE: 'https://parallelum.com.br/fipe/api/v2/cars/brands/23/models/9048/years/2021-1',
  DOLLAR: 'https://economia.awesomeapi.com.br/last/USD-BRL',
  EURO: 'https://economia.awesomeapi.com.br/last/EUR-BRL',
} as const; 