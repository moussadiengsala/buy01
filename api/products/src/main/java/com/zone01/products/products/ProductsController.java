package com.zone01.products.products;

import com.zone01.products.utils.Response;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/products")
public class ProductsController {
    private final ProductsService productsService;

    @GetMapping
    public ResponseEntity<Response<List<Products>>> getAllProducts() {
        List<Products> products = productsService.getAllProducts();
        Response<List<Products>> response = Response.<List<Products>>builder()
                .status(HttpStatus.OK.value())
                .data(products)
                .message("success")
                .build();

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Response<Products>> getProductById(@PathVariable String id) {
        return productsService.getProductById(id)
                .map(product -> {
                    Response<Products> response = Response.<Products>builder()
                            .status(HttpStatus.OK.value())
                            .data(product)
                            .message("success")
                            .build();
                    return ResponseEntity.status(HttpStatus.OK).body(response);
                })
                .orElseGet(() -> {
                    Response<Products> response = Response.<Products>builder()
                            .status(HttpStatus.NOT_FOUND.value())
                            .data(null)
                            .message("Product not found")
                            .build();
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
                });
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Response<List<Products>>> getProductsByUserId(@PathVariable String id) {
        List<Products> product = productsService.getProductByUserId(id);
        Response<List<Products>> response = Response.<List<Products>>builder()
                .status(HttpStatus.OK.value())
                .data(product)
                .message("success")
                .build();
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping
    public ResponseEntity<Response<Products>> createProduct(@Validated @RequestBody Products product, HttpServletRequest request) {
        Products createdProduct = productsService.createProduct(product, request);
        Response<Products> response = Response.<Products>builder()
                .status(HttpStatus.CREATED.value())
                .data(createdProduct)
                .message("success")
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Response<Products>> updateProduct(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates,
            HttpServletRequest request) {
        Response<Products> updatedProduct = productsService.updateProduct(request, id, updates);
        return ResponseEntity.status(updatedProduct.getStatus()).body(updatedProduct);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Response<Products>> deleteProduct(@PathVariable String id, HttpServletRequest request) {
        Response<Products> deletedProduct = productsService.deleteProduct(id, request);
        return ResponseEntity.status(deletedProduct.getStatus()).body(deletedProduct);
    }
}