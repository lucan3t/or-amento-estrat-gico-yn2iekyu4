import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { Label } from '@/components/ui/label'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password)
        if (error) throw error
        toast.success('Conta criada com sucesso!', {
          description: 'Verifique seu email para confirmar o cadastro.',
        })
      } else {
        const { error } = await signIn(email, password)
        if (error) throw error
        toast.success('Login realizado com sucesso!')
        navigate('/')
      }
    } catch (error: any) {
      toast.error('Erro na autenticação', {
        description: error.message || 'Ocorreu um erro ao tentar entrar.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) throw error
      // Redirect happens automatically to the provider
    } catch (error: any) {
      toast.error('Erro na autenticação com Google', {
        description:
          error.message || 'Ocorreu um erro ao tentar entrar com Google.',
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-primary">
            Orçamento Estratégico
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Crie sua conta para começar'
              : 'Entre para acessar o sistema'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? 'Processando...'
                : isSignUp
                  ? 'Criar Conta'
                  : 'Entrar'}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Ou continue com
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            type="button"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <img
              src="https://img.usecurling.com/i?q=google&shape=fill&color=multicolor"
              alt="Google"
              className="mr-2 h-4 w-4"
            />
            Entrar com Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-muted-foreground"
          >
            {isSignUp
              ? 'Já tem uma conta? Entre aqui'
              : 'Não tem conta? Cadastre-se'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
