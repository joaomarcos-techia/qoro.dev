'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Send, KeyRound, UserPlus, Building, AlertCircle, CheckCircle, ArrowLeft, User } from 'lucide-react';
import { inviteUser } from '@/ai/flows/user-management';
import { changePassword } from '@/lib/auth';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function SettingsPage() {
    const [inviteEmail, setInviteEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState({invite: false, password: false});
    const [feedback, setFeedback] = useState<{type: 'error' | 'success', message: string, context: 'invite' | 'password'} | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    const handleInviteUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(prev => ({...prev, invite: true}));
        setFeedback(null);
        try {
            await inviteUser({ email: inviteEmail });
            setFeedback({type: 'success', message: `Convite enviado com sucesso para ${inviteEmail}!`, context: 'invite'});
            setInviteEmail('');
        } catch (error) {
            console.error(error);
            setFeedback({type: 'error', message: 'Falha ao enviar convite. Verifique o e-mail ou tente novamente.', context: 'invite'});
        } finally {
            setIsLoading(prev => ({...prev, invite: false}));
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
         if (newPassword.length < 6) {
            setFeedback({type: 'error', message: 'A nova senha deve ter pelo menos 6 caracteres.', context: 'password'});
            return;
        }
        setIsLoading(prev => ({...prev, password: true}));
        setFeedback(null);
        try {
            await changePassword(newPassword);
            setFeedback({type: 'success', message: 'Senha alterada com sucesso!', context: 'password'});
            setNewPassword('');
        } catch (error: any) {
             console.error(error);
             if(error.code === 'auth/requires-recent-login') {
                setFeedback({type: 'error', message: 'Esta operação é sensível e requer autenticação recente. Faça login novamente antes de tentar alterar sua senha.', context: 'password'});
             } else {
                setFeedback({type: 'error', message: 'Falha ao alterar a senha. Tente novamente mais tarde.', context: 'password'});
             }
        } finally {
            setIsLoading(prev => ({...prev, password: false}));
        }
    }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div className="flex items-center justify-between mb-8">
            <div>
                <h2 className="text-3xl font-bold text-black mb-2">Configurações</h2>
                <p className="text-gray-600">Gerencie sua conta, organização e convide novos membros.</p>
            </div>
             <Link href="/dashboard">
                <div className="bg-white text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-neumorphism hover:shadow-neumorphism-hover flex items-center justify-center font-semibold">
                    <ArrowLeft className="mr-2 w-5 h-5" />
                    Voltar ao Dashboard
                </div>
            </Link>
        </div>

      <div className="space-y-12">
        {/* Invite User Section */}
        <div className="bg-white p-8 rounded-2xl shadow-neumorphism border border-gray-200">
            <div className="flex items-start">
                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white mr-6 shadow-neumorphism">
                    <UserPlus className="w-6 h-6" />
                </div>
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-black mb-1">Convidar novo usuário</h3>
                    <p className="text-gray-600 mb-6">O membro convidado terá acesso à organização e seus dados.</p>
                    <form onSubmit={handleInviteUser} className="flex items-center gap-4">
                        <div className="relative flex-grow">
                             <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                placeholder="E-mail do convidado"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl shadow-neumorphism-inset focus:ring-2 focus:ring-primary transition-all duration-300"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading.invite}
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-neumorphism hover:shadow-neumorphism-hover flex items-center justify-center font-semibold disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            <Send className="mr-2 w-5 h-5" />
                            {isLoading.invite ? 'Enviando...' : 'Enviar Convite'}
                        </button>
                    </form>
                    {feedback && feedback.context === 'invite' && (
                         <div className={`mt-4 p-4 rounded-lg flex items-center text-sm ${feedback.type === 'success' ? 'bg-green-100 border-l-4 border-green-500 text-green-800' : 'bg-red-100 border-l-4 border-red-500 text-red-700'}`}>
                            {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
                            <span>{feedback.message}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Account Settings Section */}
        <div className="bg-white p-8 rounded-2xl shadow-neumorphism border border-gray-200">
             <div className="flex items-start">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white mr-6 shadow-neumorphism">
                    <KeyRound className="w-6 h-6" />
                </div>
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-black mb-1">Configurações da Conta</h3>
                    <p className="text-gray-600 mb-6">Altere sua senha de acesso.</p>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                         <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input type="email" value={currentUser?.email || ''} disabled className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl shadow-neumorphism-inset cursor-not-allowed"/>
                        </div>
                         <div className="relative">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input 
                                type="password" 
                                placeholder="Nova Senha (mínimo 6 caracteres)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required 
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl shadow-neumorphism-inset focus:ring-2 focus:ring-primary transition-all duration-300"/>
                        </div>
                        <div className="flex justify-end">
                            <button 
                                type="submit"
                                disabled={isLoading.password}
                                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-neumorphism hover:shadow-neumorphism-hover flex items-center justify-center font-semibold disabled:opacity-75 disabled:cursor-not-allowed">
                                {isLoading.password ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </form>
                     {feedback && feedback.context === 'password' && (
                         <div className={`mt-4 p-4 rounded-lg flex items-center text-sm ${feedback.type === 'success' ? 'bg-green-100 border-l-4 border-green-500 text-green-800' : 'bg-red-100 border-l-4 border-red-500 text-red-700'}`}>
                            {feedback.type === 'success' ? <CheckCircle className="w-5 h-5 mr-3" /> : <AlertCircle className="w-5 h-5 mr-3" />}
                            <span>{feedback.message}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
