'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import FreestyleLines from '@/components/FreestyleLines'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MoreHorizontal, Shield, User, UserCog, Search, Loader2 } from 'lucide-react'
import { motion } from 'motion/react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export default function CRMPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      router.push('/')
    }
  }, [profile, router])

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
      
      if (error) {
        console.error('Error fetching users:', error.message)
      } else {
        setUsers(data || [])
      }
      setLoading(false)
    }

    fetchUsers()

    // Realtime subscription
    const channel = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const updateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
      if (error) throw error
    } catch (error) {
      console.error(error)
    }
  }

  const removeUser = async (userId: string) => {
    if (confirm('Tem certeza que deseja remover este usuário?')) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId)
        if (error) throw error
      } catch (error) {
        console.error(error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <FreestyleLines />
      <Header />

      <main className="container mx-auto px-4 py-12 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">CRM & PERMISSÕES</h1>
            <p className="text-black/60">Controle o acesso dos usuários à plataforma Nexo</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40 w-4 h-4" />
            <Input 
              placeholder="Buscar usuários..." 
              className="pl-10 rounded-full border-2 border-black/10 focus:border-blue-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-2 border-black shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-black text-white p-6">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <UserCog className="w-5 h-5" />
                Gerenciamento de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b-2 border-black/5">
                    <TableHead className="font-bold text-black py-6 px-6">Usuário</TableHead>
                    <TableHead className="font-bold text-black py-6">E-mail</TableHead>
                    <TableHead className="font-bold text-black py-6">Permissão</TableHead>
                    <TableHead className="font-bold text-black py-6">Status</TableHead>
                    <TableHead className="text-right py-6 px-6"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-blue-50/50 transition-colors border-b border-black/5">
                      <TableCell className="py-6 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {user.name?.charAt(0)}
                          </div>
                          <span className="font-bold">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 text-black/60">{user.email}</TableCell>
                      <TableCell className="py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          user.role === 'admin' ? 'bg-black text-white' : 
                          user.role === 'editor' ? 'bg-blue-600 text-white' : 
                          'bg-black/5 text-black/60'
                        }`}>
                          {user.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                          {user.role}
                        </span>
                      </TableCell>
                      <TableCell className="py-6">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold ${
                          user.status === 'Ativo' ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Ativo' ? 'bg-green-600' : 'bg-orange-600'}`} />
                          {user.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-6 px-6 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0 hover:bg-black/5 rounded-full" />}>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-2 border-black shadow-xl">
                            <DropdownMenuItem onClick={() => updateRole(user.id, 'admin')} className="font-bold">Tornar Admin</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateRole(user.id, 'editor')} className="font-bold">Tornar Editor</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateRole(user.id, 'viewer')} className="font-bold">Tornar Viewer</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => removeUser(user.id)} className="text-red-600 font-bold">Remover Usuário</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
