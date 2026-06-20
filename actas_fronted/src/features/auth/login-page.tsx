import { FormEvent, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../shared/auth/auth-context';
import { supabase } from '../../shared/auth/supabase-client';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export function LoginPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to="/app" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError('Credenciales inválidas');
      return;
    }
    navigate('/app');
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/40 p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="font-display text-3xl font-bold">
            <span className="text-accent">Actas</span> <span className="text-primary">Institucionales</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Trazabilidad y seguimiento de acuerdos</p>
        </div>

        <Card className="p-6">
          <h2 className="font-display text-xl font-bold">Bienvenido de nuevo</h2>
          <p className="mb-4 text-sm text-muted-foreground">Ingresa con tu correo institucional.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@institucion.edu"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" variant="hero" className="w-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />} Iniciar sesión
            </Button>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
          </form>
        </Card>
      </div>
    </div>
  );
}
