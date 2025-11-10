/**
 * Extract error message from API error response
 */
export const getErrorMessage = (error: unknown): string => {
  // Check if it's an axios error with response
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'error' in error.response.data
  ) {
    return String(error.response.data.error);
  }

  // Check if it's a regular Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback
  return 'An unexpected error occurred';
};