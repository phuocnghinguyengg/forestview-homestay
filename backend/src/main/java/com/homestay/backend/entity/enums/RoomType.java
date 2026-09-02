package com.homestay.backend.entity.enums;

public enum RoomType {
    STANDARD("Standard Room"),
    SUPERIOR("Superior Room"),
    DELUXE("Deluxe Room"),
    SUITE("Suite Room");

    private final String label;

    RoomType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
