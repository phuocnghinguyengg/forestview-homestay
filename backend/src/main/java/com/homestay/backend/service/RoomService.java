package com.homestay.backend.service;

import com.homestay.backend.dto.request.RoomRequest;
import com.homestay.backend.dto.response.RoomResponse;
import com.homestay.backend.entity.Room;
import com.homestay.backend.exception.ResourceNotFoundException;
import com.homestay.backend.repository.RoomRepository;
import com.homestay.backend.service.mapper.RoomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDate;
import com.homestay.backend.dto.response.PricePreviewResponse;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final PricingService pricingService;

    public List<RoomResponse> getAllActiveRooms() {
        return roomRepository.findAll().stream()
                .filter(Room::getActive)
                .map(RoomMapper::toResponse)
                .toList();
    }

    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + id));
        return RoomMapper.toResponse(room);
    }

    // ---- Admin ----

    public List<RoomResponse> getAllRoomsForAdmin() {
        return roomRepository.findAll().stream()
                .map(RoomMapper::toResponse)
                .toList();
    }

    public RoomResponse createRoom(RoomRequest request) {
        Room room = Room.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .pricePerNight(request.getPricePerNight())
                .maxGuests(request.getMaxGuests())
                .recommendedGuests(request.getRecommendedGuests() == null ? Math.min(2, request.getMaxGuests()) : request.getRecommendedGuests())
                .extraGuestFee(request.getExtraGuestFee() == null ? BigDecimal.ZERO : request.getExtraGuestFee())
                .images(request.getImages())
                .amenities(request.getAmenities())
                .type(request.getType())
                .active(true)
                .weekendPrice(request.getWeekendPrice())
                .holidayPrice(request.getHolidayPrice())
                .roomSize(request.getRoomSize())
                .bedConfiguration(request.getBedConfiguration())
                .viewDescription(request.getViewDescription())
                .bathroomDescription(request.getBathroomDescription())
                .floor(request.getFloor())
                .checkInTime(request.getCheckInTime())
                .checkOutTime(request.getCheckOutTime())
                .houseRules(request.getHouseRules())
                .build();
        return RoomMapper.toResponse(roomRepository.save(room));
    }

    public RoomResponse updateRoom(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + id));

        room.setName(request.getName());
        room.setDescription(request.getDescription());
        room.setAddress(request.getAddress());
        room.setPricePerNight(request.getPricePerNight());
        room.setMaxGuests(request.getMaxGuests());
        room.setRecommendedGuests(request.getRecommendedGuests() == null ? Math.min(2, request.getMaxGuests()) : request.getRecommendedGuests());
        room.setExtraGuestFee(request.getExtraGuestFee() == null ? BigDecimal.ZERO : request.getExtraGuestFee());
        room.setImages(request.getImages());
        room.setAmenities(request.getAmenities());
        room.setType(request.getType());
        room.setWeekendPrice(request.getWeekendPrice());
        room.setHolidayPrice(request.getHolidayPrice());
        room.setRoomSize(request.getRoomSize());
        room.setBedConfiguration(request.getBedConfiguration());
        room.setViewDescription(request.getViewDescription());
        room.setBathroomDescription(request.getBathroomDescription());
        room.setFloor(request.getFloor());
        room.setCheckInTime(request.getCheckInTime());
        room.setCheckOutTime(request.getCheckOutTime());
        room.setHouseRules(request.getHouseRules());

        return RoomMapper.toResponse(roomRepository.save(room));
    }

    public void toggleRoomActive(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found: " + id));
        room.setActive(!room.getActive());
        roomRepository.save(room);
    }

    public void deleteRoom(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new ResourceNotFoundException("Room not found: " + id);
        }
        roomRepository.deleteById(id);
    }

    public PricePreviewResponse getPricePreview(Long roomId, LocalDate checkIn, LocalDate checkOut, int guestCount) {
        if (!checkOut.isAfter(checkIn)) throw new IllegalArgumentException("Ngày trả phòng phải sau ngày nhận phòng");
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new ResourceNotFoundException("Room not found: " + roomId));
        if (guestCount < 1 || guestCount > room.getMaxGuests()) throw new IllegalArgumentException("Số khách không hợp lệ");
        PricingService.PriceBreakdown price = pricingService.calculate(room, checkIn, checkOut);
        int includedGuests = room.getRecommendedGuests() == null ? 1 : room.getRecommendedGuests();
        int extraGuests = Math.max(0, guestCount - includedGuests);
        BigDecimal extra = (room.getExtraGuestFee() == null ? BigDecimal.ZERO : room.getExtraGuestFee())
                .multiply(BigDecimal.valueOf(extraGuests)).multiply(BigDecimal.valueOf(price.nights()));
        return PricePreviewResponse.builder()
                .checkIn(checkIn).checkOut(checkOut).nights(price.nights())
                .weekdaySubtotal(price.weekdayPrice()).weekendSubtotal(price.weekendPrice()).holidaySubtotal(price.holidayPrice())
                .weekdayNights(price.weekdayNights()).weekendNights(price.weekendNights()).holidayNights(price.holidayNights())
                .extraGuestSubtotal(extra).totalBeforeDiscount(price.basePrice().add(price.holidayPrice()).add(extra))
                .build();
    }
}
