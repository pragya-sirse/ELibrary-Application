package com.example.ELibraryApllication.service;


import com.example.ELibraryApllication.model.Document;
import com.example.ELibraryApllication.model.Tag;
import com.example.ELibraryApllication.repo.CommentRepo;
import com.example.ELibraryApllication.repo.DocumentRepo;
import com.example.ELibraryApllication.repo.TagRepo;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service

public class DocumentService {
    private final DocumentRepo documentRepo;
    private final TagRepo tagRepo;
    private final CommentRepo commentRepo;

    public DocumentService(DocumentRepo documentRepo, TagRepo tagRepo,CommentRepo commentRepo) {
        this.documentRepo = documentRepo;
        this.tagRepo = tagRepo;
        this.commentRepo=commentRepo;
    }

    public List<Document> getAllDocuments() {
        return documentRepo.findAll();
    }

    // ✅ Save document (JSON body) with tags
    public Document uploadDocumentWithTags(Document doc, List<String> tagNames) {
        doc.setUploadedAt(LocalDateTime.now());
        attachTagsToDocument(doc, tagNames);
        return documentRepo.save(doc);
    }

    // ✅ Save document (file upload) with tags
    public Document uploadFileWithTags(MultipartFile file, String title, String description, List<String> tagNames) throws IOException {
        Path uploadDir = Paths.get("uploads");
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        String filePath = uploadDir.resolve(file.getOriginalFilename()).toString();
        Files.copy(file.getInputStream(), Paths.get(filePath), StandardCopyOption.REPLACE_EXISTING);

        Document doc = new Document();
        doc.setTitle(title);
        doc.setDescription(description);
        doc.setFileUrl("/uploads/" + file.getOriginalFilename()); // 👈 must start with /
        doc.setUploadedAt(LocalDateTime.now());

        attachTagsToDocument(doc, tagNames);

        return documentRepo.save(doc);
    }



    public Optional<Document> getDocument(Long id) {
        return documentRepo.findById(id);
    }

    @Transactional
    public void deleteDocument(Long id) {
        // Find the actual relationship field name
        commentRepo.deleteByDocumentId(id); // or whatever the actual field is
        documentRepo.deleteById(id);
    }
    public List<Document> findByTag(String tagName) {
        return documentRepo.findByTags_Name(tagName);
    }

    // ✅ Helper: attach tags
    private void attachTagsToDocument(Document doc, List<String> tagNames) {
        if (tagNames != null && !tagNames.isEmpty()) {
            Set<Tag> tags = new HashSet<>();
            for (String name : tagNames) {
                Tag tag = tagRepo.findByName(name);
                if (tag == null) {
                    tag = new Tag();
                    tag.setName(name);
                    tag = tagRepo.save(tag);
                }
                tags.add(tag);
            }
            doc.setTags(tags);
        }
    }
}
