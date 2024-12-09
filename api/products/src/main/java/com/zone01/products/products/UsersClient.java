package com.zone01.products.products;

import com.zone01.products.utils.Response;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "users")
public interface UsersClient {

    @GetMapping("/api/v1/users/validate-access")
    Response<UserDTO> validateAccess(@RequestHeader("Authorization") String authorization);
}

