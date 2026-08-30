package com.homestay.backend.entity.enums;

public enum MembershipTier {
    NONE("Chưa có", 0, 0, 0),
    BRONZE("Đồng", 20, 10_000_000L, 5),
    SILVER("Bạc", 40, 20_000_000L, 10),
    GOLD("Vàng", 80, 40_000_000L, 15),
    DIAMOND("Kim cương", 160, 80_000_000L, 20);

    private final String label;
    private final int bookingThreshold;
    private final long spendingThreshold;
    private final int discountPercent;

    MembershipTier(String label, int bookingThreshold, long spendingThreshold, int discountPercent) {
        this.label = label;
        this.bookingThreshold = bookingThreshold;
        this.spendingThreshold = spendingThreshold;
        this.discountPercent = discountPercent;
    }

    public String getLabel() { return label; }
    public int getBookingThreshold() { return bookingThreshold; }
    public long getSpendingThreshold() { return spendingThreshold; }
    public int getDiscountPercent() { return discountPercent; }
}
