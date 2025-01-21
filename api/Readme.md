# API Documentation

## Base URLs
- Users Service: `/api/v1/users`
- Products Service: `/api/v1/products`
- Media Service: `/api/v1/media`

## Authentication
All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Users API

### Data Transfer Objects (DTOs)

#### UserRegistrationDTO
```json
{
  "name": "string",     // 2-20 chars, letters, spaces, hyphens, apostrophes only
  "email": "string",    // Valid email format
  "password": "string", // Min 8 chars, must include uppercase, lowercase, number, special char
  "role": "ENUM",      // User role
  "avatar": "file"     // Optional image file
}
```

#### UserLoginDTO
```json
{
  "email": "string",    // Valid email format
  "password": "string"  // Min 8 chars, must include uppercase, lowercase, number, special char
}
```

#### UpdateUserDTO
```json
{
  "name": "string",          // Optional
  "prev_password": "string", // Required for password change
  "new_password": "string",  // Optional
  "role": "ENUM",           // Optional
  "avatar": "file"          // Optional
}
```

#### UserDTO (Response)
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "ENUM",
  "avatar": "string"  // Avatar file path
}
```

### Authentication Endpoints

#### Register User
- **POST** `/api/v1/users/auth/register`
- **Content-Type**: `multipart/form-data`
- **Request Body**: `UserRegistrationDTO`
- **Example Request:**
```bash
curl -X POST /api/v1/users/auth/register \
  -H "Content-Type: multipart/form-data" \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "password=SecurePass1!" \
  -F "role=CLIENT" \
  -F "avatar=@path/to/avatar.jpg"
```

#### Login
- **POST** `/api/v1/users/auth/login`
- **Content-Type**: `application/json`
- **Request Body**: `UserLoginDTO`
- **Example Request:**
```bash
curl -X POST /api/v1/users/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass1!"
  }'
```

#### Refresh Token
- **POST** `/api/v1/users/auth/refresh-token`
- **Description**: Generate new access token using refresh token
- **Returns**: New authentication token response

### User Management

#### Get User by ID
- **GET** `/api/v1/users/{id}`
- **Returns**: User details

#### Get All Users
- **GET** `/api/v1/users/`
- **Returns**: List of all users

#### Get User Avatar
- **GET** `/api/v1/users/avatar/{filename}`
- **Returns**: User's avatar image

#### Update User
- **PUT** `/api/v1/users/{id}`
- **Content-Type**: `multipart/form-data`
- **Security**: Requires authentication, user can only update their own profile
- **Request Body**: `UpdateUserDTO`

#### Delete User
- **DELETE** `/api/v1/users/{id}`
- **Security**: Requires authentication, user can only delete their own account

## Products API

### Data Transfer Objects (DTOs)

#### CreateProductDTO
```json
{
  "name": "string",       // 2-50 chars, letters, numbers, spaces, hyphens, apostrophes
  "description": "string", // 10-255 chars, letters, numbers, basic punctuation
  "price": number,        // 0.01 to 100,000.00
  "quantity": integer     // 1 to 10,000
}
```

#### UpdateProductsDTO
```json
{
  "name": "string",       // Optional
  "description": "string", // Optional
  "price": number,        // Optional
  "quantity": integer     // Optional
}
```
Note: All fields in UpdateProductsDTO are optional but follow the same validation rules as CreateProductDTO when provided.

### Product Management Endpoints

#### Create Product
- **POST** `/api/v1/products/`
- **Security**: Requires authentication (Seller role)
- **Content-Type**: `application/json`
- **Request Body**: `CreateProductDTO`
- **Example Request:**
```bash
curl -X POST /api/v1/products/ \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "price": 199.99,
    "quantity": 50
  }'
```

#### Get All Products
- **GET** `/api/v1/products/`
- **Query Parameters**:
  - `page` (default: 0)
  - `size` (default: 0)
- **Returns**: Paginated list of products

#### Get Product by ID
- **GET** `/api/v1/products/{id}`
- **Returns**: Product details

#### Get Products by User ID
- **GET** `/api/v1/products/users/{id}`
- **Query Parameters**:
  - `page` (default: 0)
  - `size` (default: 0)
- **Returns**: Paginated list of products for specific user

#### Delete Product
- **DELETE** `/api/v1/products/{id}`
- **Security**: Requires authentication, only owner can delete

#### Update Product
- **PUT** `/api/v1/products/{id}`
- **Security**: Requires authentication, only owner can update
- **Request Body**: `UpdateProductsDTO`
- **Example Request:**
```bash
curl -X PUT /api/v1/products/{id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 179.99,
    "quantity": 45
  }'
```

## Media API

### Media Model
```json
{
  "id": "string",          // MongoDB generated ID
  "imagePath": "string",   // Path to stored image
  "productId": "string"    // Associated product ID
}
```

### Media Management Endpoints

#### Upload Media
- **POST** `/api/v1/media/{product_id}`
- **Security**: Requires authentication (Product owner only)
- **Content-Type**: `multipart/form-data`
- **Request Parameters**:
  - `files`: List of image files (max 2MB each)
- **Example Request:**
```bash
curl -X POST /api/v1/media/{product_id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@image1.jpg" \
  -F "files=@image2.jpg"
```

#### Update Media
- **PUT** `/api/v1/media/{media_id}`
- **Security**: Requires authentication (Product owner only)
- **Content-Type**: `multipart/form-data`
- **Example Request:**
```bash
curl -X PUT /api/v1/media/{media_id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: multipart/form-data" \
  -F "files=@new-image.jpg"
```

#### Get Media by ID
- **GET** `/api/v1/media/{id}`
- **Returns**: Media metadata

#### Get Product Image
- **GET** `/api/v1/media/{productId}/{imagePath}`
- **Returns**: Image file

#### Get Media by Product ID
- **GET** `/api/v1/media/product/{id}`
- **Returns**: List of media items for product

#### Upload Media
- **POST** `/api/v1/media/{product_id}`
- **Security**: Requires authentication
- **Content-Type**: `multipart/form-data`
- **Request Parameters**:
  - `files`: List of image files (max 2MB each)


#### Delete Media
- **DELETE** `/api/v1/media/{media_id}`
- **Security**: Requires authentication, only owner can delete



## Additional Notes
- Authentication tokens must be included in the Authorization header
- Images are stored with unique filenames to prevent conflicts
- Product owners can only modify their own products and associated media
- Sellers can have multiple products
- Media files are permanently deleted when associated product is deleted
- Users can only modify their own resources (products, media)
- Pagination is available for product listings
- All image uploads are limited to 2MB per file


## Responses format
responses follow the same structure with appropriate HTTP status codes:
```json
{
  "status": <status_code>,
  "data": {},
  "message": "<response_message>"
}
```


// generate keystore.p12 files
keytool -genkeypair -alias dev-localhost -keyalg RSA -keysize 2048 -validity 365 -storetype PKCS12 -keystore keystore.p12 -storepass changeit

