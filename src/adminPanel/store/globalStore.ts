/**
 * Simple global store with in-memory mock data.
 * If you already have Zustand or another store, replace this with your real implementation.
 */
type TransferStatus = "pending" | "approved" | "rejected";

export type Transfer = {
  id: string;
  playerId: string;
  playerName?: string;
  fromClubId?: string;
  fromClubName?: string;
  toClubId?: string;
  toClubName?: string;
  amount?: number;
  fee?: number;
  status: TransferStatus;
  createdAt?: string;
  date?: string;
  rejectReason?: string;
};

export type User = {
  id: string;
  name?: string;
  email?: string;
  role?: "admin" | "mod" | "user";
  active?: boolean;
  createdAt?: string;
};

type Listener = () => void;

import { getMarket, saveMarket } from "@/utils/sharedStorage";

class Store {
  private _transfers: Transfer[] = [];
  private _users: User[] = [];
  private _market: { marketStart?: string; marketEnd?: string; salaryCap?: string } = getMarket();
  private _listeners: Listener[] = [];

  subscribe(fn: Listener) {
    this._listeners.push(fn);
    return () => {
      this._listeners = this._listeners.filter(l => l !== fn);
    };
  }

  private emit() {
    this._listeners.forEach(l => l());
  }

  // ---- Users ----
  get users() {
    return this._users;
  }

  refreshUsers = async () => {
    // Mock: seed predictable users if empty
    if (this._users.length === 0) {
      this._users = [
        { id: "u1", name: "Admin Test", email: "admin@test.com", role: "admin", active: true, createdAt: new Date().toISOString() },
        { id: "u2", name: "María López", email: "maria@example.com", role: "user", active: true, createdAt: new Date().toISOString() },
        { id: "u3", name: "Juan Pérez", email: "juan@example.com", role: "mod", active: false, createdAt: new Date().toISOString() },
      ];
    }
    this.emit();
  };

  banUser = (id: string) => {
    this._users = this._users.map(u => u.id === id ? { ...u, active: false } : u);
    this.emit();
  };

  activateUser = (id: string) => {
    this._users = this._users.map(u => u.id === id ? { ...u, active: true } : u);
    this.emit();
  };

  // ---- Transfers ----
  get transfers() {
    return this._transfers;
  }

  refreshTransfers = async () => {
    // Mock: seed predictable transfers if empty
    if (this._transfers.length === 0) {
      const now = new Date();
      const today = now.toISOString();
      this._transfers = [
        { id: "t1", playerId: "p1", playerName: "Carlos Díaz", fromClubName: "Club A", toClubName: "Club B", amount: 1000000, status: "pending", createdAt: today },
        { id: "t2", playerId: "p2", playerName: "Luis García", fromClubName: "Club C", toClubName: "Club D", amount: 2500000, status: "approved", createdAt: today },
        { id: "t3", playerId: "p3", playerName: "Pedro Gómez", fromClubName: "Club E", toClubName: "Club F", amount: 500000, status: "rejected", createdAt: today, rejectReason: "Fuera de periodo" },
      ];
    }
    this.emit();
  };

  approveTransfer = (id: string) => {
    this._transfers = this._transfers.map(t => t.id === id ? { ...t, status: "approved" as TransferStatus } : t);
    this.emit();
  };

  rejectTransfer = (id: string, reason?: string) => {
    this._transfers = this._transfers.map(t => t.id === id ? { ...t, status: "rejected" as TransferStatus, rejectReason: reason } : t);
    this.emit();
  };

  // ---- Market ----
  get market() {
    return this._market;
  }

  loadMarketSettings = () => {
    this._market = getMarket();
    this.emit();
  };

  saveMarketSettings = (data: { marketStart?: string; marketEnd?: string; salaryCap?: string }) => {
    this._market = { ...data };
    saveMarket(this._market);
    this.emit();
  };
}

const singleton = new Store();

/**
 * React-friendly hook API without external libs.
 * Usage:
 *   const { users, refreshUsers } = useGlobalStore();
 */
import { useSyncExternalStore } from "react";

let snapshot = {
  users: singleton.users,
  transfers: singleton.transfers,
  market: singleton.market,
};

const subscribe = (cb: () => void) =>
  singleton.subscribe(() => {
    snapshot = { users: singleton.users, transfers: singleton.transfers, market: singleton.market };
    cb();
  });

const getSnapshot = () => snapshot;

export function useGlobalStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot);

  return {
    ...state,
    refreshUsers: singleton.refreshUsers,
    banUser: singleton.banUser,
    activateUser: singleton.activateUser,
    refreshTransfers: singleton.refreshTransfers,
    approveTransfer: singleton.approveTransfer,
    rejectTransfer: singleton.rejectTransfer,
    loadMarketSettings: singleton.loadMarketSettings,
    saveMarketSettings: singleton.saveMarketSettings,
  };
}

export default useGlobalStore;
