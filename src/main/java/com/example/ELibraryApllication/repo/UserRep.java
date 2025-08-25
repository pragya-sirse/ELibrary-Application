package com.example.ELibraryApllication.repo;

import com.example.ELibraryApllication.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.Optional;
@Repository

public interface UserRep extends JpaRepository<User , Long> {
    Optional<User> findByEmail(String email);
}
