package com.homestay.backend.entity.enums;

public enum MembershipTier {
    NONE(0, 0, 0),
    BRONZE(20, 10_000_000L, 5),
    SILVER(40, 20_000_000L, 10),
    GOLD(80, 40_000_000L, 15),
    DIAMOND(160, 80_000_000L, 20);

    private final int bookingThreshold;
    private final long spendingThreshold;
    private final int discountPercent;

    MembershipTier(int bookingThreshold, long spendingThreshold, int discountPercent) {
        this.bookingThreshold = bookingThreshold;
        this.spendingThreshold = spendingThreshold;
        this.discountPercent = discountPercent;
    }

    public int getBookingThreshold() { return bookingThreshold; }
    public long getSpendingThreshold() { return spendingThreshold; }
    public int getDiscountPercent() { return discountPercent; }
}
