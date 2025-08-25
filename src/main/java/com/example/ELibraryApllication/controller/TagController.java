package com.example.ELibraryApllication.controller;

import com.example.ELibraryApllication.model.Tag;
import com.example.ELibraryApllication.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagService tagService;
    public TagController(TagService tagService){
        this.tagService=tagService;
    }
    @GetMapping
    public List<Tag> getAllTags() {
        return tagService.getAllTags();
    }

    @PostMapping
    public Tag createTag(@RequestBody Tag tag) {
        return tagService.createTag(tag);
    }


}
