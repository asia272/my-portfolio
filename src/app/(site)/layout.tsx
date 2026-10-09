import Preloader from "@/components/common/Preloader";
import ScrollProgress from "@/components/common/ScrollProgress";
import Navbar from "@/components/layout/Navbar";
import { AssistantWidget } from "@/components/assistant/AssistantWidget";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Preloader />
            <ScrollProgress />
            <Navbar />
            {children}
            <AssistantWidget />
        </>
    );
}