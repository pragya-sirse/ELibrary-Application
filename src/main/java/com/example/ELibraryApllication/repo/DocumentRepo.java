package com.example.ELibraryApllication.repo;

import com.example.ELibraryApllication.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface DocumentRepo extends JpaRepository<Document,Long > {
    List<Document> findByTags_Name(String tagName);
}
