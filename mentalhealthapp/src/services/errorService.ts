// src/services/errorService.ts

export const logError = (message: string, error: any) => {
    console.error(`${message}:`, error);
    
    // Log error details
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // You could also send errors to a remote logging service here
    // Example:
    // sendToRemoteLoggingService(message, error);
  };