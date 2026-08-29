package com.homestay.backend.repository;

import com.homestay.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import com.homestay.backend.entity.enums.RoomType;
import java.util.List;


public interface RoomRepository extends JpaRepository<Room, Long> {
    long countByActiveTrue();
    List<Room> findByTypeAndActiveTrue(RoomType type);
}