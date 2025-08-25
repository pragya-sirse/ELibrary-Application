package com.example.ELibraryApllication.service;

import com.example.ELibraryApllication.model.Comments;
import com.example.ELibraryApllication.model.Document;
import com.example.ELibraryApllication.repo.CommentRepo;
import com.example.ELibraryApllication.repo.DocumentRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommentService {
    private final CommentRepo commentRepo;
    private final DocumentRepo documentRepo;

    public CommentService(CommentRepo commentRepo,DocumentRepo documentRepo){
        this.commentRepo=commentRepo;
        this.documentRepo=documentRepo;
    }
    public List<Comments> getCommentsForDocument(Long documentId) {
        return commentRepo.findByDocumentId(documentId);
    }

    public Comments addComment(Long documentId, Comments comment) {
        comment.setCreatedAt(LocalDateTime.now());

        Document doc = documentRepo.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        comment.setDocument(doc);

        return commentRepo.save(comment);
    }


}
