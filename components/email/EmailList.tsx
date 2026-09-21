import React from "react";
import { EmailCard, EmailCardProps } from "./EmailCard";
import { EmailEmptyState } from "./EmailEmptyState";

export interface EmailListProps {
    items: Omit<EmailCardProps, 'onClick' | 'onMarkRead' | 'onDelete'>[];
    onItemClick: (item: any) => void;
    onMarkRead?: (id: string) => void;
    onDelete?: (id: string) => void;
}

export function EmailList({ items, onItemClick, onMarkRead, onDelete }: EmailListProps) {
    if (!items || items.length === 0) {
        return <EmailEmptyState />;
    }

    return (
        <div className="flex flex-col border border-border/50 rounded-xl overflow-hidden bg-background">
            {items.map((item) => (
                <EmailCard
                    key={item.id}
                    {...item}
                    onClick={() => onItemClick(item)}
                    onMarkRead={onMarkRead}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
