import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  completeProfile,
  createRideRequest,
  getSessionProfile,
  sendPhoneOtp,
  setDriverAvailability,
  signOut,
  verifyPhoneOtp,
} from "@/lib/supabase/kjapp-api";

export type UserRole = "customer" | "driver";
export type DriverStatus = "pending" | "approved" | "rejected";

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  driverStatus?: DriverStatus;
  profileImage?: string;
}

export interface PaymentMethod {
  id: string;
  type: "card" | "vipps";
  last4?: string;
  brand?: string;
  isDefault: boolean;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface RideRequest {
  id: string;
  pickupAddress: string;
  destinationAddress: string;
  pickupLat: number;
  pickupLng: number;
  destLat: number;
  destLng: number;
  rideType: "standard" | "xl" | "premium";
  estimatedPrice: number;
  estimatedTime: number;
  status: "searching" | "matched" | "arriving" | "in_progress" | "completed" | "cancelled";
  driverName?: string;
  driverRating?: number;
  driverCar?: string;
  driverPlate?: string;
}

interface CreateRideInput {
  pickupAddress: string;
  destinationAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  destLat?: number;
  destLng?: number;
  estimatedPrice: number;
  durationMinutes?: number;
  distanceKm?: number;
}

interface AppContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isOnboarded: boolean;
  isLoading: boolean;
  currentRide: RideRequest | null;
  paymentMethods: PaymentMethod[];
  savedAddresses: SavedAddress[];
  driverOnline: boolean;
  setUser: (user: UserProfile | null) => Promise<void>;
  setIsOnboarded: (val: boolean) => Promise<void>;
  setCurrentRide: (ride: RideRequest | null) => void;
  setPaymentMethods: (methods: PaymentMethod[]) => Promise<void>;
  setSavedAddresses: (addresses: SavedAddress[]) => void;
  setDriverOnline: (online: boolean) => Promise<void>;
  sendLoginCode: (phone: string) => Promise<string>;
  verifyLoginCode: (phone: string, code: string) => Promise<void>;
  completeUserProfile: (fullName: string, phone: string, role: UserRole) => Promise<UserProfile | null>;
  createRide: (input: CreateRideInput) => Promise<RideRequest>;
  refreshUser: () => Promise<UserProfile | null>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [isOnboarded, setIsOnboardedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentRide, setCurrentRide] = useState<RideRequest | null>(null);
  const [paymentMethods, setPaymentMethodsState] = useState<PaymentMethod[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
    {
      id: "1",
      label: "Hjem",
      address: "Bogstadveien 24, Oslo",
      latitude: 59.9271,
      longitude: 10.7195,
    },
    {
      id: "2",
      label: "Jobb",
      address: "Aker Brygge 1, Oslo",
      latitude: 59.9107,
      longitude: 10.7278,
    },
  ]);
  const [driverOnlineState, setDriverOnlineState] = useState(false);

  useEffect(() => {
    loadPersistedState();
  }, []);

  async function loadPersistedState() {
    try {
      setIsLoading(true);
      const onboarded = await AsyncStorage.getItem("kjapp_onboarded");
      const payments = await AsyncStorage.getItem("kjapp_payments");
      if (onboarded === "true") setIsOnboardedState(true);
      if (payments) setPaymentMethodsState(JSON.parse(payments));

      const profile = await getSessionProfile();
      setUserState(profile);
      if (profile?.role === "driver") {
        setDriverOnlineState(false);
      }
    } catch (e) {
      console.error("Failed to load KJAPP state:", e);
      setUserState(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function persistUser(u: UserProfile | null) {
    setUserState(u);
  }

  async function persistOnboarded(val: boolean) {
    setIsOnboardedState(val);
    await AsyncStorage.setItem("kjapp_onboarded", val ? "true" : "false");
  }

  async function persistPayments(methods: PaymentMethod[]) {
    setPaymentMethodsState(methods);
    await AsyncStorage.setItem("kjapp_payments", JSON.stringify(methods));
  }

  async function sendLoginCode(phone: string) {
    return sendPhoneOtp(phone);
  }

  async function verifyLoginCode(phone: string, code: string) {
    await verifyPhoneOtp(phone, code);
    const profile = await getSessionProfile();
    setUserState(profile);
  }

  async function completeUserProfile(fullName: string, phone: string, role: UserRole) {
    const profile = await completeProfile({ fullName, phone, role });
    setUserState(profile);
    return profile;
  }

  async function createRide(input: CreateRideInput) {
    const ride = await createRideRequest(input);
    setCurrentRide(ride);
    return ride;
  }

  async function refreshUser() {
    const profile = await getSessionProfile();
    setUserState(profile);
    return profile;
  }

  async function setDriverOnline(online: boolean) {
    await setDriverAvailability(online);
    setDriverOnlineState(online);
  }

  async function logout() {
    await signOut();
    setUserState(null);
    setCurrentRide(null);
    setDriverOnlineState(false);
    await AsyncStorage.multiRemove(["kjapp_payments"]);
  }

  return (
    <AppContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isOnboarded,
        isLoading,
        currentRide,
        paymentMethods,
        savedAddresses,
        driverOnline: driverOnlineState,
        setUser: persistUser,
        setIsOnboarded: persistOnboarded,
        setCurrentRide,
        setPaymentMethods: persistPayments,
        setSavedAddresses,
        setDriverOnline,
        sendLoginCode,
        verifyLoginCode,
        completeUserProfile,
        createRide,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
