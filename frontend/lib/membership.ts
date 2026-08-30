import { MembershipTier } from "@/types";

const DISCOUNT_BY_TIER: Record<MembershipTier, number> = {
  NONE: 0,
  BRONZE: 5,
  SILVER: 10,
  GOLD: 15,
  DIAMOND: 20,
};

export function membershipDiscountPercent(tier: MembershipTier | undefined): number {
  if (!tier) return 0;
  return DISCOUNT_BY_TIER[tier] ?? 0;
}
