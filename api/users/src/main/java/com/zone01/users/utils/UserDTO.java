package com.zone01.users.utils;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDTO {
    private String id;
    private String name;
    private String email;
    private Role role;
    private  String avatar;
}
