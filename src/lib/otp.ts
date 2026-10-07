import crypto from "node:crypto";

export function generateOtp(): string {
    return crypto
        .randomInt(100000, 1000000)
        .toString();
}

export function hashValue(value: string): string {
    return crypto
        .createHash("sha256")
        .update(value)
        .digest("hex");
}

export function generateSessionToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

export function getOtpExpiry(): number {
    return Date.now() + 10 * 60 * 1000;
}

export function getSessionExpiry(): number {
    return Date.now() + 7 * 24 * 60 * 60 * 1000;
}