package com.homestay.backend.controller;

import com.homestay.backend.entity.Holiday;
import com.homestay.backend.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/holidays")
@RequiredArgsConstructor
public class PublicHolidayController {
    private final HolidayRepository holidayRepository;

    @GetMapping
    public ResponseEntity<List<Holiday>> getAll() {
        return ResponseEntity.ok(holidayRepository.findAll());
    }
}
