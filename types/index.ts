export type UserRole =
  | 'admin'
  | 'customer'
  | 'delivery_man'
  | 'wash_man'
  | 'iron_man'
  | 'dry_clean_man'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'pickup_assigned'
  | 'picked_up'
  | 'in_wash'
  | 'wash_complete'
  | 'in_dry_clean'
  | 'dry_clean_complete'
  | 'waiting_for_iron'
  | 'in_iron'
  | 'iron_complete'
  | 'ready'
  | 'delivery_assigned'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export type AssignmentStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'rejected'
export type AssignmentType = 'pickup' | 'delivery' | 'wash' | 'iron' | 'dry_clean'
export type PaymentStatus = 'pending' | 'paid' | 'partial'
export type PaymentType = 'cod_pickup' | 'cod_delivery' | 'advance' | 'partial'

export type UserSummary = {
  id: string
  fullName: string
  email: string
  phone: string
  role: UserRole
  profilePictureUrl?: string | null
  active: boolean
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  user: UserSummary
}

export type AddressResponse = {
  id: string
  label: string
  addressLine1: string
  addressLine2?: string | null
  area: string
  city: string
  postalCode?: string | null
  latitude?: number | null
  longitude?: number | null
  defaultAddress: boolean
}

export type ServiceCategory = {
  id: string
  name: string
  description?: string | null
  iconUrl?: string | null
  icon?: string
  startingPrice?: number
  displayOrder?: number
}

export type ClothingType = {
  id: string
  name: string
  iconUrl?: string | null
  icon?: string
  displayOrder?: number
}

export type PricingCell = {
  id: string
  serviceCategoryId: string
  serviceCategoryName: string
  clothingTypeId: string
  clothingTypeName: string
  price: number
  effectiveFrom?: string
  currency: 'BDT' | string
}

export type TrackingEvent = {
  id: string
  orderId?: string
  status: OrderStatus
  statusLabel: string
  description: string
  updatedBy?: string | null
  updatedByName?: string | null
  locationLat?: number | null
  locationLng?: number | null
  timestamp: string
}

export type OrderItemResponse = {
  id: string
  clothingTypeId: string
  clothingTypeName: string
  serviceCategoryId: string
  serviceCategoryName: string
  quantity: number
  unitPrice: number
  subtotal: number
  notes?: string | null
}

export type OrderResponse = {
  id: string
  orderNumber: string
  customer: UserSummary
  pickupAddress: AddressResponse
  deliveryAddress: AddressResponse
  preferredPickupDate: string
  preferredPickupTimeSlot: string
  preferredDeliveryDate: string
  preferredDeliveryTimeSlot: string
  specialInstructions?: string | null
  status: OrderStatus
  paymentMethod: 'cod' | 'online'
  paymentStatus: PaymentStatus
  totalAmount: number
  paidAmount: number
  items: OrderItemResponse[]
  createdAt: string
  updatedAt: string
}

export type OrderSummary = {
  id: string
  orderNumber: string
  status: OrderStatus
  totalAmount: number
  paidAmount: number
  itemsCount: number
  createdAt: string
  customerName: string
}

export type Assignment = {
  id: string
  orderId: string
  orderNumber: string
  assignedTo?: UserSummary
  customerName?: string
  address?: string
  assignmentType: AssignmentType
  status: AssignmentStatus
  assignedAt?: string
  acceptedAt?: string | null
  completedAt?: string | null
  preferredTime?: string
  amountDue?: number
  notes?: string | null
}

export type PaymentLedgerRow = {
  id: string
  orderId?: string
  orderNumber: string
  collectedBy?: string | null
  collectedByName?: string | null
  amount: number
  paymentType: PaymentType
  collectedAt: string
  verified: boolean
  notes?: string | null
  verifiedBy?: string | null
  verifiedAt?: string | null
}
