const SESSION_ID_KEY = "stevia_session_id";

export const sessionStorage = {
  // Get or create session ID
  getSessionId: () => {
    try {
      if (typeof window === "undefined") return null;
      
      let sessionId = localStorage.getItem(SESSION_ID_KEY);
      
      if (!sessionId) {
        // Generate a new session ID (UUID-like format)
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem(SESSION_ID_KEY, sessionId);
      }
      
      return sessionId;
    } catch (error) {
      console.error("Failed to get session ID:", error);
      return null;
    }
  },

  // Clear session ID
  clearSessionId: () => {
    try {
      if (typeof window === "undefined") return;
      localStorage.removeItem(SESSION_ID_KEY);
    } catch (error) {
      console.error("Failed to clear session ID:", error);
    }
  },
};

