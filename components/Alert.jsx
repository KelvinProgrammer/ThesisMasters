// components/Alert.jsx - Enhanced Mobile-Responsive Alert Component
import { useState, useEffect } from 'react'

export default function Alert({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  className = '', 
  autoClose = false,
  autoCloseDelay = 5000,
  position = 'static' // 'static', 'fixed-top', 'fixed-bottom'
}) {
  const [isVisible, setIsVisible] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)

  const typeStyles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: 'text-green-500',
      iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
      iconBg: 'bg-green-100'
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-500',
      iconPath: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z',
      iconBg: 'bg-red-100'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-500',
      iconPath: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z',
      iconBg: 'bg-yellow-100'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-500',
      iconPath: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
      iconBg: 'bg-blue-100'
    }
  }

  const positionStyles = {
    static: '',
    'fixed-top': 'fixed top-4 left-4 right-4 z-50 max-w-md mx-auto',
    'fixed-bottom': 'fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto'
  }

  const styles = typeStyles[type]

  // Auto close functionality
  useEffect(() => {
    if (autoClose && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, autoCloseDelay)

      return () => clearTimeout(timer)
    }
  }, [autoClose, autoCloseDelay])

  // Animation on mount
  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsVisible(false)
      if (onClose) {
        onClose()
      }
    }, 200)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div 
      className={`
        ${positionStyles[position]} 
        ${className}
        transition-all duration-300 ease-in-out
        ${isAnimating ? 'transform scale-95 opacity-75' : 'transform scale-100 opacity-100'}
      `}
    >
      <div 
        className={`
          ${styles.container} 
          border rounded-lg shadow-md
          transform transition-all duration-300 ease-in-out
        `}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="p-4">
          <div className="flex items-start">
            {/* Icon */}
            <div className={`flex-shrink-0 ${styles.iconBg} rounded-full p-1 mr-3`}>
              <svg 
                className={`w-4 h-4 sm:w-5 sm:h-5 ${styles.icon}`} 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path fillRule="evenodd" d={styles.iconPath} clipRule="evenodd"/>
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="font-medium text-sm sm:text-base mb-1 break-words">
                  {title}
                </h3>
              )}
              <p className="text-sm leading-relaxed break-words">
                {message}
              </p>
            </div>

            {/* Close Button */}
            {onClose && (
              <button
                onClick={handleClose}
                className={`
                  flex-shrink-0 ml-3 p-1 rounded-md transition-colors duration-200
                  ${styles.icon} hover:bg-black hover:bg-opacity-10
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current
                `}
                aria-label="Close alert"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path 
                    fillRule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Progress bar for auto-close */}
          {autoClose && autoCloseDelay > 0 && (
            <div className="mt-3">
              <div className="bg-black bg-opacity-10 rounded-full h-1">
                <div 
                  className="bg-current h-1 rounded-full transition-all ease-linear"
                  style={{
                    width: '100%',
                    animation: `shrink ${autoCloseDelay}ms linear`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Toast-style alerts for fixed positioning
export function ToastAlert({ children, ...props }) {
  return (
    <Alert 
      {...props} 
      position="fixed-top"
      autoClose={true}
      autoCloseDelay={5000}
    >
      {children}
    </Alert>
  )
}

// Alert container for managing multiple alerts
export function AlertContainer({ alerts = [], onRemoveAlert }) {
  return (
    <div className="fixed top-4 left-4 right-4 z-50 space-y-2 pointer-events-none">
      <div className="max-w-md mx-auto space-y-2">
        {alerts.map((alert, index) => (
          <div key={alert.id || index} className="pointer-events-auto">
            <Alert
              type={alert.type}
              title={alert.title}
              message={alert.message}
              onClose={() => onRemoveAlert && onRemoveAlert(alert.id || index)}
              autoClose={true}
              autoCloseDelay={alert.duration || 5000}
            />
          </div>
        ))}
      </div>
    </div>
  )
}