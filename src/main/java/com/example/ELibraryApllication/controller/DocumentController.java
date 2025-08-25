package com.example.ELibraryApllication.controller;

import com.example.ELibraryApllication.model.Document;
import com.example.ELibraryApllication.service.DocumentService;
import jakarta.persistence.EntityNotFoundException;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
@RestController
@RequestMapping("/api/documents")

public class DocumentController {


    private final DocumentService documentService;
    public DocumentController(DocumentService documentService){
        this.documentService=documentService;
    }
    @GetMapping
    public List<Document> getAllDocuments() {
        return documentService.getAllDocuments();
    }

    // ✅ Upload document via JSON + tags
    @PostMapping
    public Document uploadDocument(
            @RequestBody Document doc,
            @RequestParam(required = false) List<String> tags
    ) {
        return documentService.uploadDocumentWithTags(doc, tags);
    }

    // ✅ Upload PDF/Notes + tags
    @PostMapping("/upload")
    public Document uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "tags", required = false) List<String> tags
    ) throws IOException {
        return documentService.uploadFileWithTags(file, title, description, tags);
    }

    @GetMapping("/{id}")
    public Document getDocument(@PathVariable Long id) {
        return documentService.getDocument(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(@PathVariable Long id) {
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.ok().build();
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting document: " + e.getMessage());
        }
    }
    @GetMapping("/search")
    public List<Document> searchByTag(@RequestParam String tag) {
        return documentService.findByTag(tag);
    }



}
