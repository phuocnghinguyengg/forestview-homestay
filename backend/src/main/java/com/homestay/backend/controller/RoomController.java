package com.homestay.backend.controller;

import com.homestay.backend.dto.request.RoomRequest;
import com.homestay.backend.dto.response.RoomResponse;
import com.homestay.backend.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    // ---- Public ----

    @GetMapping("/api/rooms")
    public ResponseEntity<List<RoomResponse>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllActiveRooms());
    }

    @GetMapping("/api/rooms/{id}")
    public ResponseEntity<RoomResponse> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    // ---- Admin ----

    @GetMapping("/api/admin/rooms")
    public ResponseEntity<List<RoomResponse>> getAllRoomsForAdmin() {
        return ResponseEntity.ok(roomService.getAllRoomsForAdmin());
    }

    @PostMapping("/api/admin/rooms")
    public ResponseEntity<RoomResponse> createRoom(@Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.createRoom(request));
    }

    @PutMapping("/api/admin/rooms/{id}")
    public ResponseEntity<RoomResponse> updateRoom(@PathVariable Long id, @Valid @RequestBody RoomRequest request) {
        return ResponseEntity.ok(roomService.updateRoom(id, request));
    }

    @PatchMapping("/api/admin/rooms/{id}/toggle-active")
    public ResponseEntity<Void> toggleActive(@PathVariable Long id) {
        roomService.toggleRoomActive(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/admin/rooms/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }
}