import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, FileCheck2, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../shared/auth/auth-context';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

export function LoginPage() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (session) return <Navigate to="/app" replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      navigate('/app', { replace: true });
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'No pudimos iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-sidebar p-12 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0 opacity-20" style={dotPattern} />
        <div className="pointer-events-none absolute -right-32 top-20 size-96 rounded-full bg-accent/20 blur-3xl" />
        <Link to="/" className="relative flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-cyan-300 font-display font-extrabold text-sidebar-primary-foreground">
            A
          </span>
          <span className="font-display text-lg font-bold">Actas Institucionales</span>
        </Link>

        <div className="relative max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-sidebar-border bg-sidebar-accent/50 px-3 py-1.5 text-xs font-semibold">
            <ShieldCheck className="size-4 text-sidebar-primary" /> Acceso institucional seguro
          </span>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight xl:text-5xl">
            Del acuerdo registrado al compromiso cumplido.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-sidebar-foreground/70">
            Consulta actas, actualiza avances y conserva las evidencias de cada compromiso con trazabilidad completa.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {['Información centralizada', 'Acceso según tu rol', 'Evidencias protegidas', 'Seguimiento en tiempo real'].map((item) => (
              <span key={item} className="flex items-center gap-2 text-sm text-sidebar-foreground/85">
                <CheckCircle2 className="size-4 text-sidebar-primary" /> {item}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-sidebar-foreground/45">Plataforma institucional de gestión y seguimiento</p>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft className="size-4" /> Volver al inicio
          </Link>

          <div className="mb-7 lg:hidden">
            <div className="mb-5 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-soft">
              <FileCheck2 className="size-5" />
            </div>
            <p className="font-display text-xl font-bold text-primary">Actas Institucionales</p>
          </div>

          <div className="mb-7">
            <p className="text-sm font-semibold text-accent">Bienvenido</p>
            <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">Inicia sesión</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Usa las credenciales asignadas por tu institución.
            </p>
          </div>

          <Card className="border-border/80 p-6 shadow-card sm:p-7">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Correo institucional</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nombre@institucion.edu"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-primary"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                {loading ? 'Validando acceso...' : 'Ingresar a la plataforma'}
              </Button>
            </form>
          </Card>

          <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
            El acceso y las acciones realizadas quedan protegidos por las políticas de seguridad institucional.
          </p>
        </div>
      </section>
    </main>
  );
}

const dotPattern = {
  backgroundImage: 'radial-gradient(circle at 1px 1px, oklch(1 0 0 / 0.35) 1px, transparent 0)',
  backgroundSize: '28px 28px',
} as const;
