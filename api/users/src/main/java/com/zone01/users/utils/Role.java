package com.zone01.users.utils;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Set;
import java.util.stream.Collectors;

@Getter
@RequiredArgsConstructor
public enum Role {

    SELLER(Set.of(
            Permission.SELLER_READ,
            Permission.SELLER_CREATE,
            Permission.SELLER_UPDATE,
            Permission.SELLER_DELETE,
            Permission.PRODUCT_READ,
            Permission.PRODUCT_CREATE,
            Permission.PRODUCT_UPDATE,
            Permission.PRODUCT_DELETE
    )),

    CLIENT(Set.of(
            Permission.CLIENT_READ,
            Permission.CLIENT_UPDATE,
            Permission.CLIENT_CREATE,
            Permission.CLIENT_DELETE,
            Permission.PRODUCT_READ // Only read permission for products
    ));

    private final Set<Permission> permissions;

    public Set<SimpleGrantedAuthority> getAuthorities() {
        Set<SimpleGrantedAuthority> authorities = getPermissions().stream()
                .map(permission -> new SimpleGrantedAuthority(permission.getPermission()))
                .collect(Collectors.toSet());
        authorities.add(new SimpleGrantedAuthority("ROLE_" + this.name()));
        return authorities;
    }
}
