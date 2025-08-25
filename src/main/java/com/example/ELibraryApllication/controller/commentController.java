package com.example.ELibraryApllication.controller;

import com.example.ELibraryApllication.model.Comments;
import com.example.ELibraryApllication.model.Document;
import com.example.ELibraryApllication.service.CommentService;
import com.example.ELibraryApllication.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents/{documentId}/comments")
public class commentController {
    private final CommentService commentService;



    public commentController(CommentService commentService){
        this.commentService=commentService;

    }
    @GetMapping
    public List<Comments> getComments(@PathVariable Long documentId) {
        return commentService.getCommentsForDocument(documentId);
    }

    @PostMapping
    public Comments addComment(
            @PathVariable Long documentId,
            @RequestBody Comments comment
    ) {
        return commentService.addComment(documentId, comment);
    }


}
