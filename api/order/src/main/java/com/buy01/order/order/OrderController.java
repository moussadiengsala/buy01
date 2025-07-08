package com.buy01.order.order;

import com.buy01.order.model.Response;
import com.buy01.order.model.dto.CheckoutItemDTO;
import com.buy01.order.model.dto.CheckoutRequestDTO;
import com.buy01.order.model.dto.CreateOrderDTO;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Product;
import com.stripe.param.CustomerUpdateParams;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import com.buy01.order.service.a.ProductDAO;
import com.buy01.order.service.a.CustomerUtil;
import com.buy01.order.service.a.RequestDTO;

@AllArgsConstructor
@RestController
@RequestMapping("/api/v1/order")
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/")
    public ResponseEntity<Response<Order>> createProduct(@Validated @RequestBody CreateOrderDTO order, HttpServletRequest request) {
        Response<Order> responseCreatingOrder = orderService.createOrder(order, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(responseCreatingOrder);
    }

    @PostMapping("/checkout/integrated")
    String integratedCheckout(@RequestBody CheckoutRequestDTO requestDTO) throws StripeException {

        Stripe.apiKey = "";

        // Start by finding existing customer or creating a new one if needed
        Customer customer = CustomerUtil.findOrCreateCustomer(requestDTO.getCustomerEmail(), requestDTO.getCustomerName());

        // Update customer with shipping and billing addresses
        updateCustomerAddresses(customer, requestDTO);

        // Calculate total amount from order summary (frontend already calculated)
        long totalAmount = Math.round(requestDTO.getOrderSummary().getTotal() * 100); // Convert to cents

        // Create a PaymentIntent and send it's client secret to the client
        PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                        .setAmount(totalAmount)
                        .setCurrency("usd")
                        .setCustomer(customer.getId())
                        .setAutomaticPaymentMethods(
                                PaymentIntentCreateParams.AutomaticPaymentMethods
                                        .builder()
                                        .setEnabled(true)
                                        .build()
                        )
                        .setShipping(
                                PaymentIntentCreateParams.Shipping.builder()
                                        .setName(requestDTO.getShippingAddress().getFullName())
                                        .setAddress(
                                                PaymentIntentCreateParams.Shipping.Address.builder()
                                                        .setLine1(requestDTO.getShippingAddress().getAddress1())
                                                        .setLine2(requestDTO.getShippingAddress().getAddress2())
                                                        .setCity(requestDTO.getShippingAddress().getCity())
                                                        .setState(requestDTO.getShippingAddress().getState())
                                                        .setPostalCode(requestDTO.getShippingAddress().getPostalCode())
                                                        .setCountry(requestDTO.getShippingAddress().getCountry())
                                                        .build()
                                        )
                                        .build()
                        )
                        .putMetadata("order_items", serializeItems(requestDTO.getItems()))
                        .putMetadata("subtotal", String.valueOf(requestDTO.getOrderSummary().getSubtotal()))
                        .putMetadata("shipping", String.valueOf(requestDTO.getOrderSummary().getShipping()))
                        .putMetadata("tax", String.valueOf(requestDTO.getOrderSummary().getTax()))
                        .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        // Send the client secret from the payment intent to the client
        return paymentIntent.getClientSecret();
    }

    private void updateCustomerAddresses(Customer customer, CheckoutRequestDTO requestDTO) throws StripeException {
        // Update customer with shipping address
        CustomerUpdateParams updateParams = CustomerUpdateParams.builder()
                .setShipping(
                        CustomerUpdateParams.Shipping.builder()
                                .setName(requestDTO.getShippingAddress().getFullName())
                                .setAddress(
                                        CustomerUpdateParams.Shipping.Address.builder()
                                                .setLine1(requestDTO.getShippingAddress().getAddress1())
                                                .setLine2(requestDTO.getShippingAddress().getAddress2())
                                                .setCity(requestDTO.getShippingAddress().getCity())
                                                .setState(requestDTO.getShippingAddress().getState())
                                                .setPostalCode(requestDTO.getShippingAddress().getPostalCode())
                                                .setCountry(requestDTO.getShippingAddress().getCountry())
                                                .build()
                                )
                                .build()
                )
                .setAddress(
                        CustomerUpdateParams.Address.builder()
                                .setLine1(requestDTO.getBillingAddress().getAddress1())
                                .setLine2(requestDTO.getBillingAddress().getAddress2())
                                .setCity(requestDTO.getBillingAddress().getCity())
                                .setState(requestDTO.getBillingAddress().getState())
                                .setPostalCode(requestDTO.getBillingAddress().getPostalCode())
                                .setCountry(requestDTO.getBillingAddress().getCountry())
                                .build()
                )
                .build();

        customer.update(updateParams);
    }

    private String serializeItems(CheckoutItemDTO[] items) {
        // Simple serialization for metadata - you might want to use JSON
        StringBuilder sb = new StringBuilder();
        for (CheckoutItemDTO item : items) {
            sb.append(item.getId()).append(":").append(item.getQuantity()).append(",");
        }
        return sb.toString();
    }



//    @GetMapping()
//    public ResponseEntity<Response<Page<Products>>> getAllProducts(
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "0") int size
//            ) {
//        Page<Products> products = productsService.getAllProducts(page, size);
//        Response<Page<Products>> response = Response.<Page<Products>>builder()
//                .status(HttpStatus.OK.value())
//                .data(products)
//                .message("success")
//                .build();
//
//        return ResponseEntity.status(HttpStatus.OK).body(response);
//    }
//
//    @GetMapping("/{id}")
//    public ResponseEntity<Response<Products>> getProductById(@PathVariable String id) {
//        return productsService.getProductById(id)
//                .map(product -> {
//                    Response<Products> response = Response.<Products>builder()
//                            .status(HttpStatus.OK.value())
//                            .data(product)
//                            .message("success")
//                            .build();
//                    return ResponseEntity.status(HttpStatus.OK).body(response);
//                })
//                .orElseGet(() -> {
//                    Response<Products> response = Response.<Products>builder()
//                            .status(HttpStatus.NOT_FOUND.value())
//                            .data(null)
//                            .message("Product not found")
//                            .build();
//                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
//                });
//    }
//
//    @GetMapping("/users/{id}")
//    public ResponseEntity<Response<Page<Products>>> getProductsByUserId(
//            @PathVariable String id,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "0") int size
//    ) {
//        Page<Products> product = productsService.getProductByUserId(id, page, size);
//        Response<Page<Products>> response = Response.<Page<Products>>builder()
//                .status(HttpStatus.OK.value())
//                .data(product)
//                .message("success")
//                .build();
//        return ResponseEntity.status(HttpStatus.OK).body(response);
//    }
//
//
//
//    @PutMapping("/{id}")
//    public ResponseEntity<Response<Object>> updateProduct(
//            @PathVariable String id,
//            @RequestBody UpdateProductsDTO updateProductsDTO,
//            HttpServletRequest request) {
//        Response<Object> updatedProduct = productsService.updateProduct(request, id, updateProductsDTO);
//        return ResponseEntity.status(updatedProduct.getStatus()).body(updatedProduct);
//    }
//
//    @DeleteMapping("/{id}")
//    public ResponseEntity<Response<Object>> deleteProduct(@PathVariable String id, HttpServletRequest request) {
//        Response<Object> deletedProduct = productsService.deleteProduct(id, request);
//        return ResponseEntity.status(deletedProduct.getStatus()).body(deletedProduct);
//    }
}