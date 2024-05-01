import { useEffect, useState } from "react";
import { CartItem } from "@/models/CartItem";

const CART_EVENT = "cartUpdated";
const EXPIRATION_DURATION = 86400000; // 24 hours

export default function useCart() {
    const [cart, setCart] = useState<CartItem[]>([]);

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        const expiration = localStorage.getItem("cartExpiration");
        const currentTime = Date.now();

        if (savedCart && expiration && currentTime < parseInt(expiration)) {
            setCart(JSON.parse(savedCart));
        } else {
            localStorage.removeItem("cart");
            localStorage.removeItem("cartExpiration");
            setCart([]);
        }
    }, []);

    useEffect(() => {
        if (cart.length > 0) {
            localStorage.setItem("cart", JSON.stringify(cart));
            const expirationTime = Date.now() + EXPIRATION_DURATION;
            localStorage.setItem("cartExpiration", expirationTime.toString());
            window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: cart }));
        }
    }, [cart]);

    useEffect(() => {
        const handleStorageChange = (event: Event) => {
            if (event.type === CART_EVENT) {
                const customEvent = event as CustomEvent;
                setCart(customEvent.detail);
            } else {
                const savedCart = localStorage.getItem("cart");
                const expiration = localStorage.getItem("cartExpiration");
                const currentTime = Date.now();

                if (savedCart && expiration && currentTime < parseInt(expiration)) {
                    setCart(JSON.parse(savedCart));
                } else {
                    setCart([]);
                }
            }
        };

        window.addEventListener(CART_EVENT, handleStorageChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener(CART_EVENT, handleStorageChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const addToCart = (cartItem: CartItem) => {
        const isItemInCart = cart.some(existingCartItem => existingCartItem.item.id === cartItem.item.id);
        if (isItemInCart) {
            return { success: false, message: 'Error: Item already in cart' };
        } else {
            setCart(prevCart => [...prevCart, cartItem]);
            return { success: true, message: 'Item successfully added to cart' };
        }
    };

    const removeFromCart = (itemId: number) => {
        const updatedCart = cart.filter(cartItem => cartItem.item.id !== itemId);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        setCart(updatedCart);
    };
    
    const clearCart = () => {
        localStorage.removeItem("cart");
        localStorage.removeItem("cartExpiration");
        setCart([]);
    };

    return { cart, addToCart, removeFromCart, clearCart };
}
