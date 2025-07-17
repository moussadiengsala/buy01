package com.zone01.product.product;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductsRepository extends MongoRepository<Products, String> {
    Page<Products> findProductsByUserID(String userId, Pageable pageable);
    Page<Products> findAll( Pageable pageable);
    List<Products> findByIdIn(List<String> productIds);

    Optional<List<Products>> findByUserID(String id);
}