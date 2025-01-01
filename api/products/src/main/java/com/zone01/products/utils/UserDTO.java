package com.zone01.products.utils;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDTO {
    private String id;
    private String name;
    private String email;
    private Role role;
    private String avatar;
}
