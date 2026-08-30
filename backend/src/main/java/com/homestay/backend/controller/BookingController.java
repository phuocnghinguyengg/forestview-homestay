package com.homestay.backend.controller;

import com.homestay.backend.dto.request.BookingRequest;
import com.homestay.backend.dto.response.BookingResponse;
import com.homestay.backend.entity.enums.BookingStatus;
import com.homestay.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;
    @PostMapping("/api/bookings") public ResponseEntity<BookingResponse> createBooking(@AuthenticationPrincipal UserDetails u, @Valid @RequestBody BookingRequest r) { return ResponseEntity.ok(bookingService.createBooking(u.getUsername(), r)); }
    @GetMapping("/api/bookings/me") public ResponseEntity<List<BookingResponse>> getMine(@AuthenticationPrincipal UserDetails u) { return ResponseEntity.ok(bookingService.getMyBookings(u.getUsername())); }
    @PatchMapping("/api/bookings/{id}/cancel") public ResponseEntity<Void> cancel(@AuthenticationPrincipal UserDetails u, @PathVariable Long id) { bookingService.cancelBooking(u.getUsername(), id); return ResponseEntity.noContent().build(); }
    @GetMapping("/api/bookings/{id}") public ResponseEntity<BookingResponse> getOne(@AuthenticationPrincipal UserDetails u, @PathVariable Long id) { return ResponseEntity.ok(bookingService.getBookingForUser(u.getUsername(), id)); }
    @GetMapping("/api/admin/bookings") public ResponseEntity<List<BookingResponse>> getAll() { return ResponseEntity.ok(bookingService.getAllBookings()); }
    @PatchMapping("/api/admin/bookings/{id}/status") public ResponseEntity<BookingResponse> update(@PathVariable Long id, @RequestParam BookingStatus status, @RequestParam(required = false) String reason) { return ResponseEntity.ok(bookingService.updateBookingStatus(id, status, reason)); }
}
