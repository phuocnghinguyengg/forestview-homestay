package com.homestay.backend.service;

import com.homestay.backend.dto.response.RoomResponse;
import com.homestay.backend.dto.response.RoomTypeAvailabilityResponse;
import com.homestay.backend.entity.Room;
import com.homestay.backend.entity.enums.RoomType;
import com.homestay.backend.repository.BookingRepository;
import com.homestay.backend.repository.RoomRepository;
import com.homestay.backend.service.mapper.RoomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomTypeService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final PricingService pricingService;

    public List<RoomTypeAvailabilityResponse> getAvailability(LocalDate checkIn, LocalDate checkOut) {
        List<RoomTypeAvailabilityResponse> result = new ArrayList<>();

        for (RoomType type : RoomType.values()) {
            List<Room> rooms = roomRepository.findByTypeAndActiveTrue(type);

            long available = rooms.stream()
                    .filter(r -> bookingRepository.findOverlappingBookings(r.getId(), checkIn, checkOut).isEmpty())
                    .count();

            BigDecimal minPrice = rooms.stream()
                    .filter(r -> bookingRepository.findOverlappingBookings(r.getId(), checkIn, checkOut).isEmpty())
                    .map(r -> pricingService.calculateTotalPrice(r, checkIn, checkOut))
                    .min(Comparator.naturalOrder())
                    .orElse(null);

            String cover = rooms.stream()
                    .filter(r -> r.getImages() != null && !r.getImages().isEmpty())
                    .findFirst()
                    .map(r -> r.getImages().get(0))
                    .orElse(null);

            result.add(RoomTypeAvailabilityResponse.builder()
                    .type(type)
                    .label(type.getLabel())
                    .totalRooms(rooms.size())
                    .availableRooms(available)
                    .minPrice(minPrice)
                    .coverImage(cover)
                    .build());
        }

        return result;
    }

    public List<RoomResponse> getAvailableRoomsByType(RoomType type, LocalDate checkIn, LocalDate checkOut) {
        return roomRepository.findByTypeAndActiveTrue(type).stream()
                .filter(r -> bookingRepository.findOverlappingBookings(r.getId(), checkIn, checkOut).isEmpty())
                .map(r -> {
                    RoomResponse response = RoomMapper.toResponse(r);
                    response.setQuotedStayPrice(pricingService.calculateTotalPrice(r, checkIn, checkOut));
                    return response;
                })
                .toList();
    }
}
