import { auth } from '@/lib/auth';

function Card({
  title,
  description,
  status,
  href,
  external,
  disabled,
  icon,
}: {
  title: string;
  description: string;
  status: 'ativo' | 'em breve' | 'externo' | 'em breve futuro';
  href?: string;
  external?: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
}) {
  const content = (
    <div className={`glass rounded-card p-6 h-full card-hover flex flex-col ${disabled ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
          {icon}
        </div>
        <span className={`text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full ${
          status === 'ativo'
            ? 'bg-accent/15 text-accent'
            : 'bg-black/5 dark:bg-white/10 text-muted'
        }`}>
          {status}
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
      <div className="mt-auto pt-6 flex items-center gap-2 text-sm font-medium">
        {external ? (
          <>
            Abrir site
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3h7v7"></path>
              <path d="M10 14L21 3"></path>
              <path d="M21 14v7H3V3h7"></path>
            </svg>
          </>
        ) : disabled ? (
          <span className="text-muted">Disponível em breve</span>
        ) : (
          <>
            Abrir
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7"></path>
            </svg>
          </>
        )}
      </div>
    </div>
  );

  if (href && !disabled) {
    return external ? (
      <a href={href} target="_blank" rel="noopener noreferrer">{content}</a>
    ) : (
      <a href={href}>{content}</a>
    );
  }
  return content;
}

export default async function DashboardHome() {
  const session = await auth();
  const firstName = (session?.user?.name || 'Usuário').split(' ')[0];

  return (
    <>
      <section className="glass-strong rounded-card p-8 mb-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-accent/15 blur-3xl pointer-events-none"></div>
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.2em] text-muted font-medium mb-3">Painel principal</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-2 leading-tight">
            Tudo em um lugar, {firstName}.
          </h2>
          <p className="text-muted max-w-xl">
            Suas ferramentas reunidas: calculadora de orçamentos, mockup e produção.
            Em breve: módulo de Marketing e outros que vierem.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Card
          title="Calculadora"
          description="Orçamentos de uniformes com cálculo automático e envio pelo WhatsApp."
          status="ativo"
          href="/calculadora-nova"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="3" width="16" height="18" rx="3"></rect>
              <path d="M8 7h8M8 11h2M12 11h2M16 11h.01M8 15h2M12 15h2M16 15h.01M8 19h8"></path>
            </svg>
          }
        />
        <Card
          title="Mockup"
          description="Visualização de mockups de camisa integrada ao dashboard."
          status="ativo"
          href="/mockup"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="14" rx="2"></rect>
              <path d="M3 9h18M8 21h8"></path>
            </svg>
          }
        />
        <Card
          title="Produção"
          description="Acesso ao sistema de produção existente."
          status="externo"
          disabled
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 3h7v7"></path>
              <path d="M10 14L21 3"></path>
              <path d="M21 14v7H3V3h7"></path>
            </svg>
          }
        />
        <Card
          title="Tráfego Pago"
          description="Meta Ads + Google Ads em um painel: investimento, CTR, conversões e insights."
          status="ativo"
          href="/dashboard/trafego"
          icon={
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 3v18h18"></path>
              <rect x="7" y="11" width="3" height="6"></rect>
              <rect x="13" y="7" width="3" height="10"></rect>
              <rect x="18" y="13" width="2" height="4"></rect>
            </svg>
          }
        />

        <div className="glass rounded-card p-6 sm:col-span-2 lg:col-span-2 relative overflow-hidden">
          <div className="absolute -bottom-16 -right-10 w-56 h-56 rounded-full bg-accent/10 blur-3xl pointer-events-none"></div>
          <div className="relative flex items-start justify-between gap-6 flex-wrap">
            <div className="max-w-md">
              <span className="inline-block text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded-full bg-accent/15 text-accent mb-3">
                Novidade
              </span>
              <h3 className="text-2xl font-bold mb-1">Painel de Tráfego Pago no ar</h3>
              <p className="text-sm text-muted">
                Meta Ads e Google Ads reunidos num painel só. Acompanhe investimento,
                CTR e conversões sem abrir cada plataforma.
              </p>
              <a
                href="/dashboard/trafego"
                className="inline-flex items-center gap-2 mt-4 text-sm font-semibold px-5 py-2.5 rounded-full bg-ink text-cream dark:bg-cream dark:text-ink"
              >
                Abrir painel
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7"></path>
                </svg>
              </a>
            </div>
            <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              <span className="text-xs font-medium">Online</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
