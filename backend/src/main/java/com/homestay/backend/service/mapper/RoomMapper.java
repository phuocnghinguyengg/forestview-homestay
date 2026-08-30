package com.homestay.backend.service.mapper;

import com.homestay.backend.dto.response.RoomResponse;
import com.homestay.backend.entity.Room;
import com.homestay.backend.entity.enums.RoomType;

public class RoomMapper {
    public static RoomResponse toResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .description(room.getDescription())
                .address(room.getAddress())
                .pricePerNight(room.getPricePerNight())
                .maxGuests(room.getMaxGuests())
                .images(room.getImages())
                .amenities(room.getAmenities())
                .active(room.getActive())
                .createdAt(room.getCreatedAt())
                .type(room.getType())
                .typeLabel(room.getType().getLabel())
                .weekendPrice(room.getWeekendPrice())
                .holidayPrice(room.getHolidayPrice())
                .build();
    }
}