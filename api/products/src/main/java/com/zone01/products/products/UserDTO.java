package com.zone01.products.products;

import lombok.Builder;
import lombok.Data;

import java.util.Collection;

@Data
@Builder
public class UserDTO {
    private String id;
    private String name;
    private String email;
    private Role role;
    private String avatar;
}
