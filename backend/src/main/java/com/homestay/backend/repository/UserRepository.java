package com.homestay.backend.repository;

import com.homestay.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import com.homestay.backend.entity.enums.Role;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByUsernameIgnoreCase(String username);

    boolean existsByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCase(String username);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:identifier) OR LOWER(COALESCE(u.username, '')) = LOWER(:identifier)")
    Optional<User> findByEmailOrUsername(@org.springframework.data.repository.query.Param("identifier") String identifier);

    void deleteByRoleNot(Role role);
}
