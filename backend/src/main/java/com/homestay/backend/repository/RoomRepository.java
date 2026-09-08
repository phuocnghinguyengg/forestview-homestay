package com.homestay.backend.repository;

import com.homestay.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import com.homestay.backend.entity.enums.RoomType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Query;
import java.util.List;


public interface RoomRepository extends JpaRepository<Room, Long> {
    long countByActiveTrue();
    List<Room> findByTypeAndActiveTrue(RoomType type);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from Room r where r.id = :id")
    java.util.Optional<Room> findByIdForUpdate(@Param("id") Long id);
}