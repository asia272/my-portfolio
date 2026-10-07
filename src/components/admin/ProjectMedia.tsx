"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { Id } from "../../../convex/_generated/dataModel";

import { api } from "@/../convex/_generated/api";

interface Props {
    storageId: string;
    mediaType: "IMAGE" | "VIDEO";
    alt: string;
}

export default function ProjectMedia({
    storageId,
    mediaType,
    alt,
}: Props) {
    const url = useQuery(
        api.storage.getUrl,
        {
            storageId: storageId as Id<"_storage">,
        },
    );

    if (!url) {
        return (
            <div className="aspect-video animate-pulse rounded-2xl bg-secondary" />
        );
    }

    if (mediaType === "VIDEO") {
        return (
            <video
                src={url}
                controls
                preload="metadata"
                className="aspect-video w-full rounded-2xl object-cover"
            />
        );
    }

    return (
        <Image
            src={url}
            alt={alt}
            width={1200}
            height={800}
            className="aspect-video w-full rounded-2xl object-cover"
        />
    );
}