import { useEffect, useState } from "react";
import { CartItem } from "@/models/CartItem";

const CART_EVENT = "cartUpdated";

export default function useCart() {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Effect to load the initial cart from localStorage when component mounts
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Update localStorage and dispatch event when the cart changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
        // Dispatch the event to notify other parts of the application
        window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: cart }));
    }, [cart]);

    // Listen for changes to the cart from other tabs or parts of the application
    useEffect(() => {
        const handleStorageChange = (event: Event) => {
            if (event.type === CART_EVENT) {
                const customEvent = event as CustomEvent;
                setCart(customEvent.detail);
            } else {
                const savedCart = localStorage.getItem("cart");
                setCart(savedCart ? JSON.parse(savedCart) : []);
            }
        };

        window.addEventListener(CART_EVENT, handleStorageChange);
        window.addEventListener('storage', handleStorageChange); // Listen to storage changes

        // Remove event listener on cleanup
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
        setCart(prevCart => prevCart.filter(cartItem => cartItem.item.id !== itemId));
    };

    const clearCart = () => {
        setCart([]);
    };

    return { cart, addToCart, removeFromCart, clearCart };
}