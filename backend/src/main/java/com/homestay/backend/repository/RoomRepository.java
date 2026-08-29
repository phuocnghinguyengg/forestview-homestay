package com.homestay.backend.repository;

import com.homestay.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
    long countByActiveTrue();
}