package com.example.ELibraryApllication.repo;

import com.example.ELibraryApllication.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TagRepo extends JpaRepository<Tag,Long> {
    Tag findByName(String name);

}
