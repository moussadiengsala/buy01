package com.zone01.products.products;

import com.zone01.products.dto.CreateProductDTO;
import com.zone01.products.dto.UpdateProductsDTO;
import com.zone01.products.model.Response;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/products")
public class ProductsController {
    private final ProductsService productsService;

    @GetMapping("/")
    public ResponseEntity<Response<Page<Products>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "0") int size
            ) {
        Page<Products> products = productsService.getAllProducts(page, size);
        Response<Page<Products>> response = Response.<Page<Products>>builder()
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
    public ResponseEntity<Response<Page<Products>>> getProductsByUserId(
            @PathVariable String id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "0") int size
    ) {
        Page<Products> product = productsService.getProductByUserId(id, page, size);
        Response<Page<Products>> response = Response.<Page<Products>>builder()
                .status(HttpStatus.OK.value())
                .data(product)
                .message("success")
                .build();
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/")
    public ResponseEntity<Response<Products>> createProduct(@Validated @RequestBody CreateProductDTO product, HttpServletRequest request) {
        Products createdProduct = productsService.createProduct(product, request);
        Response<Products> response = Response.<Products>builder()
                .status(HttpStatus.CREATED.value())
                .data(createdProduct)
                .message("success")
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Response<Object>> updateProduct(
            @PathVariable String id,
            @RequestBody UpdateProductsDTO updateProductsDTO,
            HttpServletRequest request) {
        Response<Object> updatedProduct = productsService.updateProduct(request, id, updateProductsDTO);
        return ResponseEntity.status(updatedProduct.getStatus()).body(updatedProduct);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Response<Object>> deleteProduct(@PathVariable String id, HttpServletRequest request) {
        Response<Object> deletedProduct = productsService.deleteProduct(id, request);
        return ResponseEntity.status(deletedProduct.getStatus()).body(deletedProduct);
    }
}