package com.zone01.products.utils;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "media")
public interface MediaClient {
    @DeleteMapping("/api/v1/media/product/{product_id}")
    Response<Object> deleteMediaByProductId(
            @PathVariable("product_id") String productId,
            @RequestHeader("Authorization") String authorization
    );
}