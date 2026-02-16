"use client";

interface CardProps {
  title?: string;
  icon?: any;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ title, icon: Icon, children, className = "", hover = false, gradient = false }: CardProps) {
  return (
    <div
      className={`
        ${gradient && 'premium-card'} 
        ${hover ? 'card-hover' : ''} 
        ${className}
      `}
    >
      {title && (
        <h2 className="text-premium-h2 mb-6 flex items-center gap-3">
          {Icon ? (
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
          ) : (
            <span className="w-1.5 h-6 bg-primary rounded-full shadow-sm shadow-primary/20"></span>
          )}
          {title}
        </h2>
      )}
      <div className="font-medium text-foreground/80 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
