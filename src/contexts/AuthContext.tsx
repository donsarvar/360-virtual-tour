/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  signInWithCredential,
  GoogleAuthProvider
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";


interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes (restoring session)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        setDoc(userDocRef, {
          displayName: currentUser.displayName || "",
          email: currentUser.email || "",
          photoURL: currentUser.photoURL || "",
          lastLogin: new Date()
        }, { merge: true }).catch(err => {
          console.error("Error saving user to Firestore:", err);
        });
      }
    }, (error) => {
      console.error("Auth state change error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google One Tap Sign-In initialization and prompt trigger
  useEffect(() => {
    if (loading || user) return;

    let isPrompted = false;

    const initializeOneTap = () => {
      if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
        const googleClient = (window as any).google.accounts.id;
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!clientId || clientId.includes("placeholder")) {
          console.warn("Google Client ID is a placeholder. Please configure VITE_GOOGLE_CLIENT_ID in .env.local to test Google One Tap.");
          return;
        }

        googleClient.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            setLoading(true);
            try {
              const credential = GoogleAuthProvider.credential(response.credential);
              await signInWithCredential(auth, credential);
            } catch (err) {
              console.error("Google One Tap Authentication Error:", err);
            } finally {
              setLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: false
        });

        if (!isPrompted) {
          googleClient.prompt((notification: any) => {
            if (notification.isNotDisplayed()) {
              console.log("One Tap not displayed:", notification.getNotDisplayedReason());
            }
          });
          isPrompted = true;
        }
      }
    };

    // Retry checking until the Google script is loaded
    const checkInterval = setInterval(() => {
      if ((window as any).google?.accounts?.id) {
        initializeOneTap();
        clearInterval(checkInterval);
      }
    }, 1000);

    return () => {
      clearInterval(checkInterval);
    };
  }, [user, loading]);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign in failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
