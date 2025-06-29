package com.zone01.products.products;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "products")
public class Products {
    @Id
    private String id;
    private String name;
    private String description;
    private Double price;
    private Integer quantity;
    @Field("user_id")
    private String userID;

}