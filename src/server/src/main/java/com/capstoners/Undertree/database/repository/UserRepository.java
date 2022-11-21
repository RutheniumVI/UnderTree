package com.capstoners.Undertree.database.repository;

import com.capstoners.Undertree.database.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {

}
