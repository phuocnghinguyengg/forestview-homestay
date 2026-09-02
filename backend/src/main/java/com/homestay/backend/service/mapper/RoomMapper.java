package com.homestay.backend.service.mapper;

import com.homestay.backend.dto.response.RoomResponse;
import com.homestay.backend.entity.Room;

public class RoomMapper {

    public static RoomResponse toResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .description(room.getDescription())
                .address(room.getAddress())
                .pricePerNight(room.getPricePerNight())
                .maxGuests(room.getMaxGuests())
                .recommendedGuests(room.getRecommendedGuests())
                .extraGuestFee(room.getExtraGuestFee())
                .images(room.getImages())
                .amenities(room.getAmenities())
                .active(room.getActive())
                .createdAt(room.getCreatedAt())
                .type(room.getType())
                .typeLabel(room.getType().getLabel())
                .weekendPrice(room.getWeekendPrice())
                .holidayPrice(room.getHolidayPrice())
                .roomSize(room.getRoomSize())
                .bedConfiguration(room.getBedConfiguration())
                .viewDescription(room.getViewDescription())
                .bathroomDescription(room.getBathroomDescription())
                .floor(room.getFloor())
                .checkInTime(room.getCheckInTime())
                .checkOutTime(room.getCheckOutTime())
                .houseRules(room.getHouseRules())
                .build();
    }
}
