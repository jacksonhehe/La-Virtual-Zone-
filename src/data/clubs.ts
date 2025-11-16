import { clubs as rawClubs } from './mockData';
import { clubLogoUrl } from '../utils/storage';

export const clubs = rawClubs.map(c => ({
  ...c,
  logo: typeof c.logo === 'string' ? clubLogoUrl(c.logo) : c.logo,
}));
