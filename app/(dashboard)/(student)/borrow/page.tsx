'use client';
import useAuth from "@/hooks/useAuth";

export default function Borrow() {
    const isAuthorized = useAuth(['Student']);

    if (!isAuthorized) {return;}

    return <>Borrow</>
}