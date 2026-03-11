"use client";
import React from "react";

interface CardProps {
  title?: string;
  icon?: any;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  action?: React.ReactNode;
}

export function Card({ title, icon: Icon, children, className = "", hover = false, gradient = false, action }: CardProps) {
  return (
    <div
      className={`
        ${gradient && 'premium-card'} 
        ${hover ? 'card-hover' : ''} 
        ${className}
      `}
    >
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-premium-h2 flex items-center gap-3">
            {Icon ? (
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
            ) : (
              <span className="w-1.5 h-6 bg-primary rounded-full shadow-sm shadow-primary/20"></span>
            )}
            {title}
          </h2>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="font-medium text-foreground/80 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
