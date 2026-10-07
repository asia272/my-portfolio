"use client";

import {
    useState,
} from "react";

import Image from "next/image";

import {
    Upload,
    Video,
    ImageIcon,
    X,
    Loader2,
} from "lucide-react";

import {
    generateProjectUploadUrl,
} from "@/actions/project-media.actions";

interface MediaUploaderProps {
    value?: string;
    mediaType?: "IMAGE" | "VIDEO";
    onChange: (
        storageId: string,
        type: "IMAGE" | "VIDEO"
    ) => void;
}

export default function MediaUploader({
    value,
    mediaType,
    onChange,
}: MediaUploaderProps) {
    const [uploading, setUploading] =
        useState(false);

    const [error, setError] =
        useState("");

    async function handleFile(
        file: File
    ) {
        setError("");

        const isImage =
            file.type.startsWith(
                "image/"
            );

        const isVideo =
            file.type.startsWith(
                "video/"
            );

        if (!isImage && !isVideo) {
            setError(
                "Only image and video files are allowed."
            );
            return;
        }

        const maxSize =
            isVideo
                ? 100 * 1024 * 1024
                : 10 * 1024 * 1024;

        if (file.size > maxSize) {
            setError(
                isVideo
                    ? "Video must be smaller than 100MB."
                    : "Image must be smaller than 10MB."
            );
            return;
        }

        try {
            setUploading(true);

            const uploadUrl =
                await generateProjectUploadUrl();

            const response =
                await fetch(
                    uploadUrl,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                file.type,
                        },

                        body: file,
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Upload failed."
                );
            }

            const result =
                await response.json();

            onChange(
                result.storageId,
                isImage
                    ? "IMAGE"
                    : "VIDEO"
            );
        } catch (error) {
            console.error(error);

            setError(
                "Unable to upload media."
            );
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="space-y-4">
            <label
                htmlFor="project-media"
                className="
                    group
                    relative
                    flex
                    min-h-60
                    cursor-pointer
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-2xl
                    border
                    border-dashed
                    border-border
                    bg-secondary/30
                    transition
                    hover:border-primary/60
                    hover:bg-secondary/50
                "
            >
                {value ? (
                    mediaType ===
                        "VIDEO" ? (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <Video className="size-10" />

                            <span className="text-sm">
                                Video uploaded
                            </span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <ImageIcon className="size-10" />

                            <span className="text-sm">
                                Image uploaded
                            </span>
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center gap-3 text-center">
                        {uploading ? (
                            <Loader2 className="size-8 animate-spin text-primary" />
                        ) : (
                            <Upload className="size-8 text-primary" />
                        )}

                        <div>
                            <p className="font-medium">
                                {uploading
                                    ? "Uploading..."
                                    : "Upload project media"}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Images up to 10MB · Videos up to 100MB
                            </p>
                        </div>
                    </div>
                )}

                <input
                    id="project-media"
                    type="file"
                    accept="image/*,video/*"
                    disabled={uploading}
                    className="sr-only"
                    onChange={(event) => {
                        const file =
                            event.target.files?.[0];

                        if (file) {
                            void handleFile(file);
                        }

                        event.target.value = "";
                    }}
                />
            </label>

            {error && (
                <p className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}