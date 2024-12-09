package com.zone01.users.utils;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Permission {

    SELLER_READ("seller:read"),
    SELLER_UPDATE("seller:update"),
    SELLER_CREATE("seller:create"),
    SELLER_DELETE("seller:delete"),

    // Permissions for Users
    CLIENT_READ("client:read"),
    CLIENT_UPDATE("client:update"),
    CLIENT_CREATE("client:create"),
    CLIENT_DELETE("client:delete"),

    // Product-specific Permissions
    PRODUCT_READ("product:read"),   // Both User and Admin can read products
    PRODUCT_CREATE("product:create"), // Only Admin can create products
    PRODUCT_UPDATE("product:update"), // Only Admin can update products
    PRODUCT_DELETE("product:delete");

    private final String permission;
}
