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

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

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
}