export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'dt' | 'admin';
  avatar?: string;
  bio?: string;
  level?: number;
  xp?: number;
  club?: string;
  clubId?: string;
  joinDate?: string;
  createdAt?: string;
  status: 'active' | 'suspended' | 'banned' | 'inactive';
  notifications?: boolean;
  lastLogin?: string;
  followers?: number;
  following?: number;
  password?: string;
}

export interface Title {
  id: string;
  name: string;
  year: number;
  type: 'league' | 'cup' | 'supercup' | 'other';
}

export interface Club {
  id: string;
  name: string;
  slug: string;
  logo: string;
  foundedYear: number;
  stadium: string;
  budget: number;
  manager: string;
  managerId?: string;
  playStyle: string;
  primaryColor: string;
  secondaryColor: string;
  description: string;
  titles: Title[];
  reputation: number;
  fanBase: number;
  morale: number;
  createdAt?: string;
}

export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export interface PlayerContract {
  expires: string;
  salary: number;
}

export interface Player {
  id: string;
  name: string;
  age: number;
  position: string;
  nationality: string;
  dorsal: number;
  club?: string;
  clubId: string;
  overall: number;
  potential: number;
  transferListed: boolean;
  matches: number;
  transferValue: number;
  value: number;
  image: string;
  attributes: PlayerAttributes;
  contract: PlayerContract;
  form: number;
  goals: number;
  assists: number;
  appearances: number;
  marketValue?: number;
  price?: number;
}
