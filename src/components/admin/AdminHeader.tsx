import {
    logoutAdmin,
} from "@/actions/admin-auth.actions";

export default function AdminHeader() {
    return (
        <header className="flex h-16 items-center justify-between border-b border-border px-6 lg:px-8">
            <div>
                <p className="text-sm font-medium">
                    Admin Panel
                </p>

                <p className="text-xs text-muted-foreground">
                    Manage your portfolio projects
                </p>
            </div>

            <form action={logoutAdmin}>
                <button
                    type="submit"
                    className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
                >
                    Sign out
                </button>
            </form>
        </header>
    );
}