package com.example.ELibraryApllication.service;

import com.example.ELibraryApllication.model.User;
import com.example.ELibraryApllication.repo.UserRep;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRep userRep;
    public UserService(UserRep userRep){
        this.userRep=userRep;
    }
    public List<User> getAllUsers() {
        return userRep.findAll();
    }

    public User registerUser(User user) {
        // TODO: add validation or password hashing later
        return userRep.save(user);
    }

    public void deleteUser(Long id) {
        userRep.deleteById(id);
    }
}
