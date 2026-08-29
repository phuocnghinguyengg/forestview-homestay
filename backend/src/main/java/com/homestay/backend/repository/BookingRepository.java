package com.homestay.backend.repository;

import com.homestay.backend.entity.Booking;
import com.homestay.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser(User user);
}