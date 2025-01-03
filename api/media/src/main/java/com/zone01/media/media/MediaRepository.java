package com.zone01.media.media;


import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MediaRepository extends MongoRepository<Media, String> {
    List<Media> findMediaByProductId(String productId);
}