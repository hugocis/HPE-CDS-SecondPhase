export interface Discount {
  id: number;
  name: string;
  description: string;
  tokenCost: number;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  validFrom: Date;
  validUntil: Date;
  maxUses?: number;
  usedCount: number;
  isActive: boolean;
  applicableTo: string[];
  qrCode?: string;
}

export interface DiscountRedemption {
  id: number;
  userId: string;
  discountId: number;
  orderId?: number;
  redeemedAt: Date;
  tokensPaid: number;
  qrCode: string;
  isUsed: boolean;
  usedAt?: Date;
}

export interface Amenity {
  id: number;
  name: string;
  description: string;
  tokenCost: number;
  type: string;
  isActive: boolean;
  maxQuantity?: number;
  qrCode?: string;
}

export interface AmenityPurchase {
  id: number;
  userId: string;
  amenityId: number;
  orderId?: number;
  quantity: number;
  tokensPaid: number;
  purchasedAt: Date;
  status: string;
  qrCode: string;
  isUsed: boolean;
  usedAt?: Date;
}