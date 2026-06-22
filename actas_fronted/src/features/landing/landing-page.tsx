import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  CloudUpload,
  CalendarClock,
  Users,
  LayoutDashboard,
  ClipboardList,
  Gauge,
  ShieldCheck,
  ArrowRight,
  Activity,
  FileSearch,
  Menu,
  X,
  Link2,
  Bell,
  QrCode,
  Fingerprint,
  CalendarDays,
  SignalHigh,
  Crown,
  UserCog,
  Megaphone,
  UserCheck,
  Database,
  Server,
  Lock,
  HardDrive,
  Smartphone,
  Boxes,
  Layers,
  FileText,
  Video,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../shared/auth/auth-context';
import { Button } from '../../components/ui/button';
import { ProgressBar, SemaforoDot } from '../../components/status';

const NAV = [
  { label: 'Problema', href: '#problema' },
  { label: 'Solución', href: '#solucion' },
  { label: 'Funcionamiento', href: '#como-funciona' },
  { label: 'Impacto', href: '#impacto' },
];

export function LandingPage() {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);

  if (session) return <Navigate to="/app" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-5 py-3">
          <a href="#inicio" className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent font-display text-sm font-extrabold text-primary-foreground shadow-soft">
              A
            </span>
            <span className="leading-tight">
              <span className="block font-display text-lg font-extrabold">
                <span className="text-accent">Actas</span> <span className="text-primary">Institucionales</span>
              </span>
              <span className="block text-[11px] text-muted-foreground">Gestión inteligente de actas y compromisos</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            {NAV.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Button asChild variant="outline">
              <Link to="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild variant="hero">
              <Link to="/login">Ingresar a la plataforma</Link>
            </Button>
          </div>

          <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menú">
            {open ? <X className="size-6 text-primary" /> : <Menu className="size-6 text-primary" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border/60 bg-background px-5 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground">
                  {n.label}
                </a>
              ))}
              <Button asChild variant="outline">
                <Link to="/login">Iniciar sesión</Link>
              </Button>
              <Button asChild variant="hero">
                <Link to="/login">Ingresar a la plataforma</Link>
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="inicio" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-secondary/60 via-background to-background" />
        <div className="pointer-events-none absolute inset-0 opacity-50" style={dotPattern} />
        <div className="relative mx-auto grid max-w-[1320px] items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-card px-3.5 py-1.5 text-xs font-semibold text-primary shadow-soft">
              <ShieldCheck className="size-4 text-accent" />
              Plataforma para calidad, auditoría y acreditación institucional
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight text-primary sm:text-5xl">
              Convierte tus actas en compromisos que sí se cumplen.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Centraliza actas, acuerdos, responsables, evidencias y asistencia en una sola plataforma para
              monitorear el cumplimiento institucional en tiempo real.
            </p>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              Deja de perseguir acuerdos en correos, hojas de cálculo y documentos dispersos. Visualiza qué
              está pendiente, quién es responsable y qué evidencia respalda cada avance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="lg">
                <Link to="/login">
                  Ingresar a la plataforma <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#como-funciona">Ver cómo funciona</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {['Trazabilidad completa', 'Evidencias centralizadas', 'Alertas de cumplimiento'].map((t) => (
                <span key={t} className="inline-flex items-center gap-2 text-primary">
                  <CheckCircle2 className="size-4 text-success" /> {t}
                </span>
              ))}
            </div>
          </div>

          <HeroMockup />
        </div>
      </section>

      {/* Problema */}
      <section id="problema" className="bg-secondary/40">
        <div className="mx-auto max-w-[1320px] px-5 py-16 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
              El problema no es crear actas, es hacer que se cumplan.
            </h2>
            <p className="mt-4 text-muted-foreground">
              En muchas instituciones, las actas registran acuerdos, responsables y fechas. Sin embargo, el
              seguimiento suele hacerse de forma manual o dispersa, dificultando conocer el avance real,
              validar evidencias y asegurar el cumplimiento dentro de los plazos establecidos.
            </p>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Activity, title: 'Acuerdos sin trazabilidad', desc: 'No siempre se sabe en qué estado está cada compromiso ni quién debe actualizarlo.' },
              { icon: FileSearch, title: 'Evidencias dispersas', desc: 'Las pruebas de cumplimiento quedan en correos, carpetas, chats o documentos separados.' },
              { icon: ClipboardList, title: 'Seguimiento manual', desc: 'Los responsables deben revisar múltiples archivos para saber qué está pendiente.' },
              { icon: AlertTriangle, title: 'Riesgo de incumplimiento', desc: 'Los acuerdos vencidos se detectan tarde y afectan procesos de calidad, auditoría y acreditación.' },
            ].map((c) => (
              <article key={c.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <span className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <c.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-primary">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Solución */}
      <section id="solucion" className="mx-auto max-w-[1320px] px-5 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
            Transformamos documentos estáticos en seguimiento inteligente.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Cada acta se convierte en un sistema activo de gestión. Cada acuerdo tiene responsable, fecha,
            avance, semáforo, evidencias y alertas para facilitar la toma de decisiones basada en
            información verificable.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-destructive/20 bg-muted/50 p-7">
            <span className="inline-flex items-center gap-2 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
              <XCircle className="size-4" /> Antes
            </span>
            <ul className="mt-5 space-y-3">
              {['Actas en Word o PDF', 'Correos dispersos', 'Hojas de cálculo manuales', 'Evidencias difíciles de encontrar', 'Seguimiento tardío'].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <X className="size-4" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-accent/30 bg-gradient-to-br from-card to-secondary/40 p-7 shadow-card">
            <span className="inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <CheckCircle2 className="size-4" /> Con la plataforma
            </span>
            <ul className="mt-5 space-y-3">
              {['Actas centralizadas', 'Acuerdos con responsables', 'Avance por porcentaje', 'Evidencias vinculadas', 'Alertas y dashboard en tiempo real'].map((t) => (
                <li key={t} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    <CheckCircle2 className="size-4" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="bg-secondary/40">
        <div className="mx-auto max-w-[1320px] px-5 py-16 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">Del acta al cumplimiento, en 4 pasos.</h2>
          </div>
          <div className="relative mt-12 grid gap-6 md:grid-cols-4">
            <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-gradient-to-r from-primary/30 via-accent/40 to-primary/30 md:block" />
            {[
              { n: '1', icon: ClipboardList, title: 'Crear el acta', desc: 'Registra reunión interna o externa, proceso, fecha, unidad orgánica, agenda y anexos.' },
              { n: '2', icon: Users, title: 'Registrar acuerdos', desc: 'Cada acuerdo incluye responsable, fecha de inicio, fecha máxima, estado y porcentaje de avance.' },
              { n: '3', icon: CloudUpload, title: 'Subir evidencias', desc: 'Adjunta documentos, fotos, videos, grabaciones o actas físicas escaneadas.' },
              { n: '4', icon: Gauge, title: 'Monitorear cumplimiento', desc: 'Visualiza dashboard, semáforos, alertas, inasistencias y cumplimiento por área.' },
            ].map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-border bg-card p-6 text-center shadow-card">
                <span className="relative z-10 mx-auto flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-lg font-bold text-primary-foreground shadow-soft">
                  {s.n}
                </span>
                <s.icon className="mx-auto mt-4 size-6 text-accent" />
                <h3 className="mt-3 font-display text-base font-bold text-primary">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="mx-auto max-w-[1320px] px-5 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">Cada usuario ve lo que necesita para actuar.</h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Crown, role: 'SuperAdmin', sub: 'Jefe del área de calidad', items: ['Revisa todas las actas', 'Visualiza indicadores generales', 'Asigna admins a usuarios', 'Supervisa cumplimiento institucional'] },
            { icon: UserCog, role: 'Admin', sub: 'Responsable de área', items: ['Revisa actas por área', 'Asigna convocadores', 'Supervisa acuerdos de su área', 'Valida evidencias e inasistencias'] },
            { icon: Megaphone, role: 'Convocador', sub: 'Responsable de crear la reunión', items: ['Convoca reuniones', 'Crea actas', 'Registra acuerdos', 'Asocia responsables y asistentes'] },
            { icon: UserCheck, role: 'Asistente', sub: 'Miembro de la comunidad académica', items: ['Registra asistencia', 'Consulta acuerdos asignados', 'Revisa calendario personal', 'Firma virtualmente su participación'] },
          ].map((r) => (
            <article key={r.role} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-soft">
                <r.icon className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-primary">{r.role}</h3>
              <p className="text-xs text-muted-foreground">{r.sub}</p>
              <ul className="mt-3 space-y-2">
                {r.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm text-foreground">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> {it}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Web + Mobile */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-[1320px] px-5 py-16 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
              Una solución conectada: intranet web + experiencia mobile.
            </h2>
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-primary">
                <LayoutDashboard className="size-5 text-accent" /> Web / Intranet
              </h3>
              <div className="space-y-3">
                {[
                  { icon: ClipboardList, title: 'Crear acta', desc: 'Formato institucional estructurado y trazable.' },
                  { icon: FileText, title: 'Acta y acuerdos', desc: 'Lista de acuerdos con responsable principal.' },
                  { icon: Gauge, title: 'Seguimiento de acuerdos', desc: 'Fecha inicio/fin, semáforo, porcentaje de avance y evidencias.' },
                  { icon: Video, title: 'Evidencias de reunión', desc: 'URL de grabación, fotos, videos, documentos y acta física.' },
                  { icon: LayoutDashboard, title: 'Dashboard general', desc: 'Indicadores por acta, acuerdo, responsable y área.' },
                ].map((c, idx, arr) => (
                  <div key={c.title}>
                    <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                        <c.icon className="size-5" />
                      </span>
                      <div>
                        <p className="font-semibold text-primary">{c.title}</p>
                        <p className="text-sm text-muted-foreground">{c.desc}</p>
                      </div>
                    </div>
                    {idx < arr.length - 1 && (
                      <div className="flex justify-center py-1 text-accent">
                        <ArrowRight className="size-4 rotate-90" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-primary">
                <Smartphone className="size-5 text-accent" /> Mobile
              </h3>
              <div className="flex justify-center">
                <div className="w-full max-w-[300px] rounded-[2.2rem] border-8 border-primary/90 bg-card p-3 shadow-soft">
                  <div className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-border" />
                  <div className="space-y-3">
                    {[
                      { icon: QrCode, title: 'QR del acta', desc: 'Escaneo para ver acta y registrar asistencia.' },
                      { icon: Fingerprint, title: 'Firma virtual', desc: 'Asistencia con reconocimiento facial.' },
                      { icon: CalendarDays, title: 'Calendario personal', desc: 'Acuerdos por usuario con fechas y recordatorios.' },
                      { icon: SignalHigh, title: 'Semáforo de áreas', desc: 'Verde: asisten, amarillo: cumplen, rojo: no cumplen.' },
                    ].map((c) => (
                      <div key={c.title} className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                          <c.icon className="size-4" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-primary">{c.title}</p>
                          <p className="text-xs text-muted-foreground">{c.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard de impacto */}
      <section id="impacto" className="mx-auto max-w-[1320px] px-5 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
            Indicadores para tomar decisiones, no solo guardar documentos.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Identifica rápidamente qué áreas avanzan, qué acuerdos están en riesgo y qué evidencias faltan
            para cerrar compromisos.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <DashboardMockup />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:content-start">
            {[
              { v: '24', l: 'Actas registradas', t: 'text-primary' },
              { v: '58', l: 'Acuerdos monitoreados', t: 'text-primary' },
              { v: '32', l: 'Acuerdos cumplidos', t: 'text-success' },
              { v: '12', l: 'En proceso', t: 'text-accent-foreground' },
              { v: '5', l: 'Vencidos', t: 'text-destructive' },
              { v: '9', l: 'Evidencias pendientes', t: 'text-[oklch(0.70_0.18_45)]' },
            ].map((k) => (
              <div key={k.l} className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <p className={`font-display text-3xl font-extrabold ${k.t}`}>{k.v}</p>
                <p className="mt-1 text-sm text-muted-foreground">{k.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tecnología */}
      <section className="bg-secondary/40">
        <div className="mx-auto max-w-[1320px] px-5 py-16 lg:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">Base tecnológica pensada para escalar.</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Layers, k: 'Frontend Web', v: 'React' },
              { icon: Server, k: 'Backend', v: 'ExpressJS' },
              { icon: Database, k: 'Base de datos', v: 'PostgreSQL' },
              { icon: Lock, k: 'Autenticación', v: 'Supabase Auth' },
              { icon: HardDrive, k: 'Archivos', v: 'Supabase Storage' },
              { icon: Smartphone, k: 'Mobile', v: 'Kotlin' },
              { icon: Boxes, k: 'Infraestructura', v: 'Docker' },
              { icon: Layers, k: 'Diseño', v: 'Domain-Driven Design' },
            ].map((t) => (
              <div key={t.k} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-accent">
                  <t.icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs text-muted-foreground">{t.k}</p>
                  <p className="font-semibold text-primary">{t.v}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-[1320px] px-5 py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-[oklch(0.28_0.11_262)] p-10 text-center text-primary-foreground shadow-soft lg:p-16">
          <div className="pointer-events-none absolute inset-0 opacity-30" style={dotPatternLight} />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl font-display text-3xl font-bold sm:text-4xl">
              Que ningún acuerdo se pierda después de una reunión.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/90">
              Monitorea compromisos, valida evidencias y fortalece procesos de calidad, auditoría y
              acreditación institucional.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to="/login">
                  Ingresar a la plataforma <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <a href="#como-funciona">Conocer el proceso</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-3 px-5 py-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-[10px] font-extrabold text-primary-foreground">
              A
            </span>
            <span className="font-display font-bold">
              <span className="text-accent">Actas</span> <span className="text-primary">Institucionales</span>
            </span>
          </div>
          <p>© 2026 Actas Institucionales — Plataforma para instituciones educativas</p>
        </div>
      </footer>
    </div>
  );
}

const dotPattern = {
  backgroundImage: 'radial-gradient(circle at 1px 1px, var(--color-border) 1px, transparent 0)',
  backgroundSize: '26px 26px',
} as const;

const dotPatternLight = {
  backgroundImage: 'radial-gradient(circle at 1px 1px, oklch(1 0 0 / 0.4) 1px, transparent 0)',
  backgroundSize: '26px 26px',
} as const;

function HeroMockup() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-accent/30 to-primary/20 blur-2xl" />
      <div className="relative rounded-3xl border border-border bg-card/80 p-5 shadow-soft backdrop-blur-sm">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { icon: FileCheck2, label: 'Actas registradas', value: '24', tone: 'text-primary' },
            { icon: Link2, label: 'Acuerdos activos', value: '58', tone: 'text-accent-foreground' },
            { icon: Gauge, label: 'Cumplimiento', value: '76%', tone: 'text-success' },
            { icon: AlertTriangle, label: 'Vencidos', value: '5', tone: 'text-destructive' },
          ].map((c) => (
            <div key={c.label} className="rounded-2xl border border-border bg-background p-3">
              <c.icon className={`size-5 ${c.tone}`} />
              <p className={`mt-2 font-display text-2xl font-extrabold ${c.tone}`}>{c.value}</p>
              <p className="text-[11px] leading-tight text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-background p-4">
            <div
              className="grid size-24 place-items-center rounded-full"
              style={{ background: 'conic-gradient(var(--color-success) 274deg, var(--color-secondary) 0)' }}
            >
              <div className="grid size-16 place-items-center rounded-full bg-background">
                <span className="font-display text-lg font-extrabold text-success">76%</span>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">Avance general</p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Acuerdos recientes</p>
            {[
              { t: 'Actualizar matriz de seguimiento', s: 'amarillo' as const, e: 'En proceso' },
              { t: 'Subir evidencia de acreditación', s: 'verde' as const, e: 'Cumplido' },
              { t: 'Validar asistencia por área', s: 'rojo' as const, e: 'Vencido' },
            ].map((r) => (
              <div key={r.t} className="flex items-center justify-between gap-2 border-t border-border/60 py-2 first:border-t-0">
                <span className="flex min-w-0 items-center gap-2 text-xs text-foreground">
                  <FileCheck2 className="size-4 shrink-0 text-accent" /> <span className="truncate">{r.t}</span>
                </span>
                <SemaforoDot semaforo={r.s} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-secondary px-3 py-2 text-xs text-primary">
          <span className="inline-flex items-center gap-1.5">
            <CloudUpload className="size-4 text-accent" /> Evidencias
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Bell className="size-4 text-accent" /> Alertas
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5">
            <CalendarClock className="size-4 text-accent" /> Calendario
          </span>
        </div>
      </div>
    </div>
  );
}

function DashboardMockup() {
  const ring = 76;
  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-soft">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="flex flex-col items-center justify-center">
          <p className="mb-3 self-start text-sm font-semibold text-primary">Avance general</p>
          <div
            className="grid size-36 place-items-center rounded-full"
            style={{ background: `conic-gradient(var(--color-success) ${ring * 3.6}deg, var(--color-secondary) 0)` }}
          >
            <div className="grid size-24 place-items-center rounded-full bg-card">
              <span className="font-display text-2xl font-extrabold text-success">{ring}%</span>
            </div>
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold text-primary">Acuerdos por estado</p>
          <div className="flex h-36 items-end gap-3">
            {[
              { h: '90%', c: 'bg-success', l: 'Cumpl.' },
              { h: '55%', c: 'bg-accent', l: 'Proceso' },
              { h: '20%', c: 'bg-destructive', l: 'Venc.' },
            ].map((b) => (
              <div key={b.l} className="flex flex-1 flex-col items-center gap-1.5">
                <div className={`w-full rounded-t-lg ${b.c}`} style={{ height: b.h }} />
                <span className="text-[10px] text-muted-foreground">{b.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-primary">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Área</th>
              <th className="px-4 py-2 text-right font-semibold">Cumplimiento</th>
            </tr>
          </thead>
          <tbody>
            {[
              { a: 'Calidad', v: 86 },
              { a: 'Acreditación', v: 72 },
              { a: 'Evaluación', v: 64 },
              { a: 'Administración', v: 91 },
              { a: 'Comunicación', v: 58 },
            ].map((r) => (
              <tr key={r.a} className="border-t border-border/60">
                <td className="px-4 py-2 text-foreground">{r.a}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-24">
                      <ProgressBar value={r.v} />
                    </div>
                    <span className="w-9 text-right font-semibold text-primary">{r.v}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
