import { useEffect, useState } from "react";
import { CartItem } from "@/models/CartItem";

const CART_EVENT = "cartUpdated";
const EXPIRATION_DURATION = 86400000; // 24 hours

export default function useCart() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Function to update local storage and handle expiration
    const updateLocalStorage = (newCart: CartItem[]) => {
        if (newCart.length > 0) {
            localStorage.setItem("cart", JSON.stringify(newCart));
            const expirationTime = Date.now() + EXPIRATION_DURATION;
            localStorage.setItem("cartExpiration", expirationTime.toString());
        } else {
        }
        window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: newCart }));
    };

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        const expiration = localStorage.getItem("cartExpiration");
        const currentTime = Date.now();
        if (savedCart && expiration && currentTime < parseInt(expiration)) {
            const parsedCart = JSON.parse(savedCart);
            setCart(parsedCart);
        } else {
            localStorage.removeItem("cart");
            localStorage.removeItem("cartExpiration");
            setCart([]);        }
        setIsInitialized(true);
    }, []);

    useEffect(() => {
        if (isInitialized) {
            updateLocalStorage(cart);
        }
    }, [cart, isInitialized]);

    useEffect(() => {
        const handleStorageChange = (event: Event) => {
            if (event instanceof CustomEvent && event.type === CART_EVENT) {
                setCart(event.detail);
            } else {
                const savedCart = localStorage.getItem("cart");
                const expiration = localStorage.getItem("cartExpiration");
                const currentTime = Date.now();

                if (savedCart && expiration && currentTime < parseInt(expiration)) {
                    const parsedCart = JSON.parse(savedCart);
                    setCart(parsedCart);
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
        setCart(prevCart => {
            const updatedCart = prevCart.filter(cartItem => cartItem.item.id !== itemId);
            return updatedCart;
        });
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem("cart");
        localStorage.removeItem("cartExpiration");
    };

    return { cart, addToCart, removeFromCart, clearCart };
}
