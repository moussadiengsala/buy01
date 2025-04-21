package com.zone01.media.media;


import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface MediaRepository extends MongoRepository<Media, String> {
    List<Media> findMediaByProductId(String productId);

    @Query(value = "{'productId': {$in: ?0}}", delete = false)
    List<Media> findMediaByProductIdIn(List<String> productIds);

    @Transactional
    void deleteAllById(List<String> ids);
}