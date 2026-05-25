import { supabase } from "./client";
import type { DriverStatus, RideRequest, UserProfile, UserRole } from "@/lib/app-context";

export type SupabaseProfile = {
  id: string;
  role: "rider" | "driver" | "fleet_owner" | "admin" | "developer" | "superadmin";
  full_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  preferred_language: string;
  is_active: boolean;
};

type SupabaseDriver = {
  id: string;
  profile_id: string;
  status: "pending" | "approved" | "suspended" | "offline" | "online" | "busy";
  rating: number | string | null;
  total_rides: number | null;
};

type SupabaseRide = {
  id: string;
  rider_id: string;
  driver_id: string | null;
  pickup_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  dropoff_address: string | null;
  dropoff_lat: number | null;
  dropoff_lng: number | null;
  status: "draft" | "requested" | "accepted" | "arrived" | "in_progress" | "completed" | "cancelled" | "driver_arriving";
  estimated_price_nok: number | string | null;
  duration_minutes: number | null;
  distance_km: number | string | null;
  requested_at: string;
};

function normalizePhone(phone: string) {
  const clean = phone.replace(/\D/g, "");
  if (clean.startsWith("47") && clean.length === 10) return `+${clean}`;
  if (clean.length === 8) return `+47${clean}`;
  if (phone.startsWith("+")) return phone;
  return `+${clean}`;
}

export function dbRoleToAppRole(role?: SupabaseProfile["role"]): UserRole {
  return role === "driver" ? "driver" : "customer";
}

export function dbDriverStatusToApp(status?: SupabaseDriver["status"] | null): DriverStatus | undefined {
  if (!status) return undefined;
  if (status === "approved" || status === "online" || status === "offline" || status === "busy") return "approved";
  if (status === "suspended") return "rejected";
  return "pending";
}

export async function sendPhoneOtp(phone: string) {
  const formattedPhone = normalizePhone(phone);
  const { error } = await supabase.auth.signInWithOtp({ phone: formattedPhone });
  if (error) throw error;
  return formattedPhone;
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const formattedPhone = normalizePhone(phone);
  const { data, error } = await supabase.auth.verifyOtp({
    phone: formattedPhone,
    token,
    type: "sms",
  });
  if (error) throw error;
  return data.user;
}

export async function getSessionProfile(): Promise<UserProfile | null> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const user = sessionData.session?.user;
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name, phone, email, avatar_url, preferred_language, is_active")
    .eq("id", user.id)
    .maybeSingle<SupabaseProfile>();

  if (profileError) throw profileError;
  if (!profile) {
    return {
      id: user.id,
      name: user.phone ?? "KJAPP-bruker",
      phone: user.phone ?? "",
      email: user.email ?? undefined,
      role: "customer",
    };
  }

  let driverStatus: DriverStatus | undefined;
  if (profile.role === "driver") {
    const { data: driver } = await supabase
      .from("drivers")
      .select("id, profile_id, status, rating, total_rides")
      .eq("profile_id", user.id)
      .maybeSingle<SupabaseDriver>();
    driverStatus = dbDriverStatusToApp(driver?.status);
  }

  return {
    id: profile.id,
    name: profile.full_name ?? user.phone ?? "KJAPP-bruker",
    phone: profile.phone ?? user.phone ?? "",
    email: profile.email ?? user.email ?? undefined,
    role: dbRoleToAppRole(profile.role),
    driverStatus,
    profileImage: profile.avatar_url ?? undefined,
  };
}

export async function completeProfile(input: { fullName: string; phone: string; role: UserRole }) {
  const { data: authData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!authData.user) throw new Error("Du må verifisere SMS-koden først.");

  const dbRole = input.role === "driver" ? "driver" : "rider";
  const phone = normalizePhone(input.phone);

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: authData.user.id,
      role: dbRole,
      full_name: input.fullName.trim(),
      phone,
      email: authData.user.email,
      preferred_language: "no",
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (profileError) throw profileError;

  if (input.role === "driver") {
    const { error: driverError } = await supabase.from("drivers").upsert(
      {
        profile_id: authData.user.id,
        status: "pending",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id" }
    );
    if (driverError) throw driverError;
  }

  return getSessionProfile();
}

export async function signOut() {
  await supabase.auth.signOut();
}

export function rideToAppRide(ride: SupabaseRide): RideRequest {
  const statusMap: Record<SupabaseRide["status"], RideRequest["status"]> = {
    draft: "searching",
    requested: "searching",
    accepted: "matched",
    driver_arriving: "arriving",
    arrived: "arriving",
    in_progress: "in_progress",
    completed: "completed",
    cancelled: "cancelled",
  };

  return {
    id: ride.id,
    pickupAddress: ride.pickup_address,
    destinationAddress: ride.dropoff_address ?? "Destinasjon ikke valgt",
    pickupLat: ride.pickup_lat ?? 59.9139,
    pickupLng: ride.pickup_lng ?? 10.7522,
    destLat: ride.dropoff_lat ?? 59.9107,
    destLng: ride.dropoff_lng ?? 10.7278,
    rideType: "standard",
    estimatedPrice: Number(ride.estimated_price_nok ?? 0),
    estimatedTime: ride.duration_minutes ?? 0,
    status: statusMap[ride.status],
  };
}

export async function createRideRequest(input: {
  pickupAddress: string;
  destinationAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  destLat?: number;
  destLng?: number;
  estimatedPrice: number;
  durationMinutes?: number;
  distanceKm?: number;
}) {
  const { data: authData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!authData.user) throw new Error("Du må være logget inn for å bestille tur.");

  const { data, error } = await supabase
    .from("rides")
    .insert({
      rider_id: authData.user.id,
      pickup_address: input.pickupAddress,
      pickup_lat: input.pickupLat ?? 59.9139,
      pickup_lng: input.pickupLng ?? 10.7522,
      dropoff_address: input.destinationAddress,
      dropoff_lat: input.destLat ?? 59.9107,
      dropoff_lng: input.destLng ?? 10.7278,
      status: "requested",
      estimated_price_nok: input.estimatedPrice,
      duration_minutes: input.durationMinutes ?? 12,
      distance_km: input.distanceKm ?? 3.2,
      metadata: { source: "mobile_app", pilot: true },
    })
    .select("id, rider_id, driver_id, pickup_address, pickup_lat, pickup_lng, dropoff_address, dropoff_lat, dropoff_lng, status, estimated_price_nok, duration_minutes, distance_km, requested_at")
    .single<SupabaseRide>();

  if (error) throw error;
  return rideToAppRide(data);
}

export async function getOpenRideRequests() {
  const { data, error } = await supabase
    .from("rides")
    .select("id, rider_id, driver_id, pickup_address, pickup_lat, pickup_lng, dropoff_address, dropoff_lat, dropoff_lng, status, estimated_price_nok, duration_minutes, distance_km, requested_at")
    .eq("status", "requested")
    .is("driver_id", null)
    .order("requested_at", { ascending: false })
    .limit(20)
    .returns<SupabaseRide[]>();
  if (error) throw error;
  return data.map(rideToAppRide);
}

export async function getOwnDriver() {
  const { data: authData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!authData.user) return null;

  const { data, error } = await supabase
    .from("drivers")
    .select("id, profile_id, status, rating, total_rides")
    .eq("profile_id", authData.user.id)
    .maybeSingle<SupabaseDriver>();
  if (error) throw error;
  return data;
}

export async function setDriverAvailability(online: boolean) {
  const driver = await getOwnDriver();
  if (!driver) throw new Error("Ingen sjåførprofil funnet.");
  if (!dbDriverStatusToApp(driver.status) || dbDriverStatusToApp(driver.status) === "pending") {
    throw new Error("Sjåførkontoen må godkjennes av admin/flåteeier før du kan gå online.");
  }

  const { error } = await supabase
    .from("drivers")
    .update({ status: online ? "online" : "offline", updated_at: new Date().toISOString() })
    .eq("id", driver.id);
  if (error) throw error;
}

export async function acceptRide(rideId: string) {
  const driver = await getOwnDriver();
  if (!driver) throw new Error("Ingen sjåførprofil funnet.");
  if (!dbDriverStatusToApp(driver.status) || dbDriverStatusToApp(driver.status) === "pending") {
    throw new Error("Sjåførkontoen må være godkjent før turer kan aksepteres.");
  }

  const { error } = await supabase
    .from("rides")
    .update({
      driver_id: driver.id,
      status: "accepted",
      accepted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", rideId)
    .eq("status", "requested")
    .is("driver_id", null);
  if (error) throw error;

  await supabase.from("drivers").update({ status: "busy", updated_at: new Date().toISOString() }).eq("id", driver.id);
}

export async function getMyRides() {
  const { data, error } = await supabase
    .from("rides")
    .select("id, rider_id, driver_id, pickup_address, pickup_lat, pickup_lng, dropoff_address, dropoff_lat, dropoff_lng, status, estimated_price_nok, duration_minutes, distance_km, requested_at")
    .order("requested_at", { ascending: false })
    .limit(50)
    .returns<SupabaseRide[]>();
  if (error) throw error;
  return data.map((ride) => ({ ...rideToAppRide(ride), requestedAt: ride.requested_at }));
}

export async function redeemDriverInvite(code: string) {
  const normalized = code.trim().toUpperCase();
  const allowedCodes = ["KJAPP-PILOT-2505", "KJAPP2026"];
  if (!allowedCodes.includes(normalized)) {
    throw new Error("Ugyldig pilotkode.");
  }

  const { data: authData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!authData.user) throw new Error("Du må være innlogget først.");

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ role: "driver", updated_at: new Date().toISOString() })
    .eq("id", authData.user.id);
  if (profileError) throw profileError;

  const { error: driverError } = await supabase.from("drivers").upsert(
    {
      profile_id: authData.user.id,
      status: "approved",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "profile_id" }
  );
  if (driverError) throw driverError;
}

export async function getRideById(rideId: string) {
  const { data, error } = await supabase
    .from("rides")
    .select("id, rider_id, driver_id, vehicle_id, pickup_address, pickup_lat, pickup_lng, dropoff_address, dropoff_lat, dropoff_lng, status, estimated_price_nok, duration_minutes, distance_km, requested_at")
    .eq("id", rideId)
    .maybeSingle<SupabaseRide>();
  if (error) throw error;
  return data ? rideToAppRide(data) : null;
}

export function subscribeRide(rideId: string, onChange: (ride: RideRequest | null) => void) {
  const channel = supabase
    .channel(`ride:${rideId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "rides", filter: `id=eq.${rideId}` },
      async () => {
        const ride = await getRideById(rideId);
        onChange(ride);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function updateRideStatus(rideId: string, status: "driver_arriving" | "arrived" | "in_progress" | "completed" | "cancelled") {
  const now = new Date().toISOString();
  const patch: Record<string, string> = { status, updated_at: now };
  if (status === "arrived") patch.arrived_at = now;
  if (status === "in_progress") patch.started_at = now;
  if (status === "completed") patch.completed_at = now;
  if (status === "cancelled") patch.cancelled_at = now;

  const { error } = await supabase.from("rides").update(patch).eq("id", rideId);
  if (error) throw error;
}
