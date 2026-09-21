import React from "react";
import { MailX } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmailEmptyStateProps {
    title?: string;
    description?: string;
}

export function EmailEmptyState({
    title = "You're all caught up",
    description = "There are no notifications to display right now."
}: EmailEmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-6">
                <MailX className="h-10 w-10 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
                {title}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
                {description}
            </p>
        </div>
    );
}
