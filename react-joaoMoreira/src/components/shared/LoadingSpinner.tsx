interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  variant?: 'primary' | 'coffee' | 'minimal';
}

export function LoadingSpinner({ 
  size = 'md', 
  message = 'Cargando...', 
  variant = 'primary' 
}: LoadingSpinnerProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (variant === 'coffee') {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12">
        {/* Coffee cup animation */}
        <div className="relative">
          <div className={`${sizes[size]} bg-gradient-to-br from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce`}>
            <span className={`${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : size === 'lg' ? 'text-3xl' : 'text-4xl'}`}>
              ☕
            </span>
          </div>
          
          {/* Steam animation */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              <div className="w-1 h-4 bg-stone-300 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0s' }}></div>
              <div className="w-1 h-3 bg-stone-300 rounded-full animate-pulse opacity-40" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-1 h-4 bg-stone-300 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
          
          {/* Ripple effect */}
          <div className="absolute inset-0 rounded-2xl border-2 border-amber-400 animate-ping opacity-30"></div>
        </div>
        
        {message && (
          <div className="text-center space-y-2">
            <p className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-stone-800 to-emerald-800 ${textSizes[size]}`}>
              {message}
            </p>
            <div className="flex items-center justify-center space-x-1">
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center space-x-3">
        <div className={`border-4 border-stone-200 border-t-emerald-500 rounded-full animate-spin ${sizes[size]}`}></div>
        {message && (
          <span className={`text-stone-600 font-medium ${textSizes[size]}`}>
            {message}
          </span>
        )}
      </div>
    );
  }

  // Primary variant (default)
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8">
      <div className="relative">
        {/* Main spinner */}
        <div className={`border-4 border-stone-200 border-t-emerald-500 border-r-amber-500 rounded-full animate-spin ${sizes[size]} shadow-lg`}></div>
        
        {/* Inner glow */}
        <div className={`absolute inset-2 border-2 border-transparent border-t-emerald-300 border-r-amber-300 rounded-full animate-spin ${sizes[size]} opacity-60`} style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-12 h-12'} bg-gradient-to-br from-emerald-500 to-amber-500 rounded-full animate-pulse`}></div>
        </div>
      </div>
      
      {message && (
        <div className="text-center space-y-2">
          <p className={`font-bold text-stone-700 ${textSizes[size]}`}>
            {message}
          </p>
          <div className="bg-stone-200 rounded-full h-1 w-32 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
    </div>
  );
} 