
export enum Role{CLIENT = 'CLIENT', SELLER = 'SELLER'}

export enum AlertVariant {
    Error = "error",
    Info = "info",
    Success = "success",
    Warning = "warning"
}

export interface Alert {
    variant: AlertVariant;
    title: string;
    message: string | string[];
}

export type Tokens = {
    accessToken: string,
    refreshToken: string
}

export type ApiResponse<T>  = {
    status: number | null,
    message: string,
    data: T
}

export interface Media {
    id: string;
    imagePath: string;
    productId: string;
}

export interface CreateProduct {
    name: string;
    description: string;
    price: number;
    quantity: number;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    userID: string;
}

export interface ProductMedia {
    product: Product;
    media: Media[]
}

export interface FullProduct {
    user: User,
    product: Product,
    media: Media[]
}

export interface PaginatedResponse<T> {
    content: T[]; // The actual list of items
    page: {
        totalPages: number; // Total number of pages
        totalElements: number; // Total number of elements
        size: number; // Number of items in the current page
        number: number; // Current page index
    }
}

export interface User {
    id: string
    name: string
    email: string
    role: 'CLIENT' | 'SELLER'
    avatar: string | null
}

export interface UserPayload {
    id: string
    name: string
    email: string
    role: 'CLIENT' | 'SELLER' | null
    avatar: string | null
    isAuthenticated: boolean
}

export interface UserLoginRequest {
    email: string | null | undefined
    password: string | null | undefined
}

export enum ACTION{CREATE = "CREATE", UPDATE = "UPDATE", DELETE = "DELETE"}

export interface ToastMessage {
    severity: string,
    summary: string,
    detail: string,
    status: "OK" | "FAILED" | "-"
}