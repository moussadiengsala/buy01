package com.buy01.order.model;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAddress {
    private String street;
    private String city;
    private String state;
    private String zipCode;
    private String country;
    private String phoneNumber;
}
