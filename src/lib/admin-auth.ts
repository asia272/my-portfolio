import "server-only";

import { cookies } from "next/headers";

import {
    api,
    fetchQuery,
} from "./convex-server";

import {
    hashValue,
} from "./otp";

const SESSION_COOKIE =
    "portfolio_admin_session";

export async function getAdminSession() {
    const cookieStore = await cookies();

    const token =
        cookieStore.get(
            SESSION_COOKIE,
        )?.value;

    if (!token) {
        return null;
    }

    const tokenHash =
        hashValue(token);

    return await fetchQuery(
        api.adminAuth.validateSession,
        {
            tokenHash,
        },
    );
}

export async function requireAdmin() {
    const session =
        await getAdminSession();

    if (!session) {
        throw new Error(
            "Unauthorized.",
        );
    }

    return session;
}

export { SESSION_COOKIE };