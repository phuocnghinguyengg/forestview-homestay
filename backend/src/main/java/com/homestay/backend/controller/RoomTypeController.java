package com.homestay.backend.controller;

import com.homestay.backend.dto.response.RoomResponse;
import com.homestay.backend.dto.response.RoomTypeAvailabilityResponse;
import com.homestay.backend.entity.enums.RoomType;
import com.homestay.backend.service.RoomTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/room-types")
@RequiredArgsConstructor
public class RoomTypeController {

    private final RoomTypeService roomTypeService;

    @GetMapping
    public ResponseEntity<List<RoomTypeAvailabilityResponse>> getAvailability(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        return ResponseEntity.ok(roomTypeService.getAvailability(checkIn, checkOut));
    }

    @GetMapping("/{type}/rooms")
    public ResponseEntity<List<RoomResponse>> getAvailableRooms(
            @PathVariable RoomType type,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        return ResponseEntity.ok(roomTypeService.getAvailableRoomsByType(type, checkIn, checkOut));
    }
}