// components/Alert.jsx
export default function Alert({ type = 'info', title, message, onClose }) {
  const typeStyles = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: 'text-green-500',
      iconPath: 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-500',
      iconPath: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-500',
      iconPath: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-500',
      iconPath: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
    }
  }

  const styles = typeStyles[type]

  return (
    <div className={`p-4 border rounded-lg ${styles.container}`}>
      <div className="flex items-start">
        <svg className={`w-5 h-5 ${styles.icon} mt-0.5 mr-3 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d={styles.iconPath} clipRule="evenodd"/>
        </svg>
        <div className="flex-1">
          {title && <h3 className="font-medium mb-1">{title}</h3>}
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`ml-3 flex-shrink-0 ${styles.icon} hover:opacity-70`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}