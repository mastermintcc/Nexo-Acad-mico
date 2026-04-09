'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, User as FirebaseUser, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth'
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore'

interface AuthContextType {
  user: FirebaseUser | null
  profile: any | null
  loading: boolean
  login: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        // Sync profile
        const userRef = doc(db, 'users', u.uid)
        const snap = await getDoc(userRef)
        
        if (!snap.exists()) {
          const isAdminEmail = u.email === 'mastermintcc@gmail.com'
          const newProfile = {
            uid: u.uid,
            name: u.displayName || 'Usuário',
            email: u.email || '',
            role: isAdminEmail ? 'admin' : 'viewer',
            status: 'Ativo'
          }
          await setDoc(userRef, newProfile)
          setProfile(newProfile)
        }

        // Listen for profile changes
        onSnapshot(userRef, (doc) => {
          setProfile(doc.data())
          setLoading(false)
        })
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const login = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const logout = async () => {
    await signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
