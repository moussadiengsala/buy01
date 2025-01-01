package com.zone01.products.utils;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zone01.products.products.Products;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;
import java.util.function.Predicate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProducts {
    private String name;
    private String description;
    private Double price;
    private Integer quantity;

    /**
     * Validates and maps update fields from a generic map of updates.
     *
     * @param updates Map of fields to update
     * @return UpdateProducts with validated fields
     * @throws IllegalArgumentException if updates are invalid
     */
    public static UpdateProducts fromUpdates(Map<String, Object> updates) {
        if (updates == null || updates.isEmpty()) {
            return new UpdateProducts();
        }

        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

        return objectMapper.convertValue(updates, UpdateProducts.class);
    }

    /**
     * Applies validated updates to a product entity.
     *
     * @param product Product entity to update
     * @param updates Map of fields to update
     * @return Map of applied updates
     */
    public Map<String, Object> applyUpdatesTo(Products product, Map<String, Object> updates) {
        Map<String, Object> appliedUpdates = new HashMap<>();

        // Name update
        if (updates.containsKey("name")) {
            String newName = (String) updates.get("name");
            validateField("name", newName,
                    value -> value != null &&
                            value.length() >= 2 &&
                            value.length() <= 50 &&
                            value.matches("^[A-Za-z0-9\\s.-]+$"),
                    "Invalid name format");

            product.setName(newName);
            appliedUpdates.put("name", newName);
        }

        // Description update
        if (updates.containsKey("description")) {
            String newDescription = (String) updates.get("description");
            validateField("description", newDescription,
                    value -> value != null &&
                            value.length() >= 10 &&
                            value.length() <= 255 &&
                            value.matches("^[A-Za-z0-9\\s.,!?()-]+$"),
                    "Invalid description format");

            product.setDescription(newDescription);
            appliedUpdates.put("description", newDescription);
        }

        // Price update
        if (updates.containsKey("price")) {
            Object priceObj = updates.get("price");
            Double newPrice = convertToDouble(priceObj);

            validateField("price", newPrice,
                    value -> value != null &&
                            value >= 0.01 &&
                            value <= 100000.00,
                    "Invalid price range");

            product.setPrice(newPrice);
            appliedUpdates.put("price", newPrice);
        }

        // Quantity update
        if (updates.containsKey("quantity")) {
            Object quantityObj = updates.get("quantity");
            Integer newQuantity = convertToInteger(quantityObj);

            validateField("quantity", newQuantity,
                    value -> value != null &&
                            value > 0 &&
                            value <= 10000,
                    "Invalid quantity");

            product.setQuantity(newQuantity);
            appliedUpdates.put("quantity", newQuantity);
        }

        return appliedUpdates;
    }

    /**
     * Checks if the update request is empty.
     *
     * @return true if no updates are present, false otherwise
     */
    @JsonIgnore
    public boolean isEmpty() {
        return (name == null || name.isEmpty()) &&
                (description == null || description.isEmpty()) &&
                (price == null) &&
                (quantity == null);
    }

    /**
     * Validates a field using the provided predicate.
     *
     * @param fieldName Name of the field being validated
     * @param value Value to validate
     * @param validator Validation predicate
     * @param errorMessage Error message if validation fails
     * @throws IllegalArgumentException if validation fails
     */
    private <T> void validateField(String fieldName, T value, Predicate<T> validator, String errorMessage) {
        if (value == null || !validator.test(value)) {
            throw new IllegalArgumentException(fieldName + ": " + errorMessage);
        }
    }

    /**
     * Converts an object to Double, handling different input types.
     *
     * @param value Object to convert
     * @return Converted Double value
     */
    private Double convertToDouble(Object value) {
        if (value == null) return null;
        if (value instanceof Double) return (Double) value;
        if (value instanceof Number) return ((Number) value).doubleValue();
        if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    /**
     * Converts an object to Integer, handling different input types.
     *
     * @param value Object to convert
     * @return Converted Integer value
     */
    private Integer convertToInteger(Object value) {
        if (value == null) return null;
        if (value instanceof Integer) return (Integer) value;
        if (value instanceof Number) return ((Number) value).intValue();
        if (value instanceof String) {
            try {
                return Integer.parseInt((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }
}