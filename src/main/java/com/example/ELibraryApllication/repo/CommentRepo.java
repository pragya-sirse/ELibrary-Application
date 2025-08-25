package com.example.ELibraryApllication.repo;

import com.example.ELibraryApllication.model.Comments;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepo extends JpaRepository<Comments,Long> {
    List<Comments> findByDocumentId(Long documentId);
    @Modifying
    @Transactional
    void deleteByDocumentId(Long documentId);
}
