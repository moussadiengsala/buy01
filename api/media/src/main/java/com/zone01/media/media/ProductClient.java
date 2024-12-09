package com.zone01.media.media;

import com.zone01.media.utils.Response;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "products")
public interface ProductClient {
    @GetMapping("/api/v1/products/{productId}")
    Response<ProductsDTO> getProductByID(@PathVariable("productId") String productId);
}
