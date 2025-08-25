package com.example.ELibraryApllication.service;

import com.example.ELibraryApllication.model.Tag;
import com.example.ELibraryApllication.repo.TagRepo;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class TagService {
    private final TagRepo tagRepo;
    public TagService(TagRepo tagRepo){
        this.tagRepo=tagRepo;
    }

    public List<Tag> getAllTags() {
        return tagRepo.findAll();
    }

    public Tag createTag(Tag tag) {
        return tagRepo.save(tag);
    }

    public Tag getTagByName(String name) {
        return tagRepo.findByName(name);
    }
}
