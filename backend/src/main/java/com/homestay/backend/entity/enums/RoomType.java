package com.homestay.backend.entity.enums;

public enum RoomType {
    SINGLE("Phòng đơn"),
    DOUBLE("Phòng đôi"),
    FAMILY("Phòng gia đình"),
    DELUXE("Phòng cao cấp");

    private final String label;

    RoomType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}