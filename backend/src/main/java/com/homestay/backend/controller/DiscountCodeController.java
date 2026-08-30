package com.homestay.backend.controller;

import com.homestay.backend.dto.request.DiscountCodeRequest;
import com.homestay.backend.dto.response.DiscountCodePreviewResponse;
import com.homestay.backend.dto.response.DiscountCodeResponse;
import com.homestay.backend.service.DiscountCodeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class DiscountCodeController {

    private final DiscountCodeService discountCodeService;

    @GetMapping("/api/discount-codes/validate")
    public ResponseEntity<DiscountCodePreviewResponse> validate(@RequestParam String code) {
        return ResponseEntity.ok(discountCodeService.validate(code));
    }

    @GetMapping("/api/admin/discount-codes")
    public ResponseEntity<List<DiscountCodeResponse>> getAll() {
        return ResponseEntity.ok(discountCodeService.getAll());
    }

    @PostMapping("/api/admin/discount-codes")
    public ResponseEntity<DiscountCodeResponse> create(@Valid @RequestBody DiscountCodeRequest request) {
        return ResponseEntity.ok(discountCodeService.create(request));
    }

    @PatchMapping("/api/admin/discount-codes/{id}/toggle-active")
    public ResponseEntity<Void> toggleActive(@PathVariable Long id) {
        discountCodeService.toggleActive(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/admin/discount-codes/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        discountCodeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
