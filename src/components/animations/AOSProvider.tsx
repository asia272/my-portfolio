"use client";

import { useEffect } from "react";
import AOS from "aos";

import "aos/dist/aos.css";

export default function AOSProvider() {
    useEffect(() => {
        AOS.init({
            duration: 800,
            easing: "ease-out-cubic",
            once: true,
            offset: 80,
            delay: 0,
            mirror: false,
        });
    }, []);

    return null;
}