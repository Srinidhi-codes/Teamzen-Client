"use client";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ title, children, className = "", hover = false, gradient = false }: CardProps) {
  return (
    <div
      className={`
        ${gradient ? 'glass' : 'bg-white'} 
        rounded-2xl shadow-lg p-6 border border-gray-100
        ${hover ? 'card-hover card-shadow' : ''} 
        transition-all duration-300
        ${className}
      `}
    >
      {title && (
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="w-1 h-6 bg-linear-to-b from-indigo-600 to-purple-600 rounded-full mr-3"></span>
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}