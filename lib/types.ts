export type RideStatus = 'requested' | 'accepted' | 'driver_arriving' | 'arrived' | 'in_progress' | 'completed' | 'cancelled';

export type Ride = {
  id: string;
  pickup: string;
  dropoff: string;
  status: RideStatus;
  price: number;
};

export type DriverState = {
  active: boolean;
  online: boolean;
};
