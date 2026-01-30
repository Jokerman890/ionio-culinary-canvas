/**
 * Maps technical database/API errors to user-friendly German messages.
 * Preserves detailed errors in console for debugging while showing
 * safe, generic messages to users.
 */

const ERROR_MAPPINGS: Record<string, string> = {
  // Auth errors
  'Invalid login credentials': 'Ungültige Anmeldedaten',
  'User already registered': 'Diese E-Mail ist bereits registriert',
  'Email not confirmed': 'E-Mail-Adresse noch nicht bestätigt',
  'Invalid email or password': 'Ungültige E-Mail oder Passwort',
  
  // Database constraint errors (generic mappings)
  'duplicate key': 'Dieser Eintrag existiert bereits',
  'foreign key violation': 'Dieser Eintrag kann nicht gelöscht werden, da er noch verwendet wird',
  'not-null constraint': 'Pflichtfeld fehlt',
  'check constraint': 'Ungültiger Wert',
  
  // RLS errors
  'new row violates row-level security': 'Keine Berechtigung für diese Aktion',
  'permission denied': 'Keine Berechtigung für diese Aktion',
  
  // Network errors
  'Failed to fetch': 'Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung',
  'NetworkError': 'Netzwerkfehler aufgetreten',
  'timeout': 'Zeitüberschreitung. Bitte versuchen Sie es erneut',
};

/**
 * Converts a technical error message to a user-friendly German message.
 * Always logs the original error to console for debugging.
 * 
 * @param error - The error object or message
 * @param context - Optional context for console logging
 * @returns User-friendly error message in German
 */
export function getUserFriendlyError(error: unknown, context?: string): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  // Always log the full error for debugging
  if (context) {
    console.error(`[${context}]`, error);
  } else {
    console.error('Error:', error);
  }
  
  // Check for known error patterns
  for (const [pattern, friendlyMessage] of Object.entries(ERROR_MAPPINGS)) {
    if (errorMessage.toLowerCase().includes(pattern.toLowerCase())) {
      return friendlyMessage;
    }
  }
  
  // Generic fallback - don't expose technical details
  return 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
}

/**
 * Creates an error handler that shows a toast with a user-friendly message.
 * Use this in catch blocks to handle errors consistently.
 * 
 * @param toast - The toast function from use-toast hook
 * @param title - The toast title (e.g., 'Fehler beim Speichern')
 * @param context - Optional context for logging
 */
export function createErrorHandler(
  toast: (props: { title: string; description?: string; variant?: 'default' | 'destructive' }) => void,
  title: string,
  context?: string
) {
  return (error: unknown) => {
    const userMessage = getUserFriendlyError(error, context);
    toast({
      title,
      description: userMessage,
      variant: 'destructive',
    });
  };
}
