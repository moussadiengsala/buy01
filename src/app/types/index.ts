
export enum Role{CLIENT = 'CLIENT', SELLER = 'SELLER'}
export type ResponseAPI  = {
    status: number | null,
    message: string,
    data: any
}

export enum AlertVariant {
    Error = "error",
    Info = "info",
    Success = "success",
    Warning = "warning"
}

export interface Alert {
    variant: AlertVariant;
    title: string;
    message: string;
}

export type Tokens = {
    accessToken: string,
    refreshToken: string
}

export interface Media {
    id: string;
    imagePath: string;
    productId: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
    media: Media[];
}

export interface User {
    id?: string
    name: string
    email: string
    password: string // Consider not exposing the password in client-side code
    role: 'CLIENT' | 'SELLER'
    avatar: string | null
    products?: Product[]
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