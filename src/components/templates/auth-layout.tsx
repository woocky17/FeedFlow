import { Logo } from "@/components/atoms/logo";

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Branded left panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex-col justify-between p-12">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-[15%] left-[10%] w-64 h-40 rounded-2xl border border-white/30 rotate-[-8deg]" />
          <div className="absolute top-[25%] left-[20%] w-56 h-36 rounded-2xl border border-white/20 rotate-[4deg]" />
          <div className="absolute top-[45%] right-[15%] w-48 h-32 rounded-2xl border border-white/25 rotate-[-3deg]" />
          <div className="absolute bottom-[30%] left-[15%] w-52 h-34 rounded-2xl border border-white/15 rotate-[6deg]" />
          <div className="absolute bottom-[15%] right-[20%] w-44 h-28 rounded-2xl border border-white/20 rotate-[-5deg]" />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl" />

        {/* Logo & branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <Logo size="lg" />
            <span className="text-2xl font-bold text-white tracking-tight">FeedFlow</span>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative z-10 max-w-sm">
          <p className="text-3xl font-semibold text-white/90 leading-snug">
            Your news, your way.
          </p>
          <p className="mt-4 text-base text-indigo-200/70 leading-relaxed">
            Stay connected with the sources that matter. Curate, filter, and never miss a beat.
          </p>
        </div>

        {/* Bottom decorative bar */}
        <div className="relative z-10 flex gap-2">
          <div className="h-1 w-12 rounded-full bg-amber-400/80" />
          <div className="h-1 w-8 rounded-full bg-amber-400/40" />
          <div className="h-1 w-4 rounded-full bg-amber-400/20" />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col justify-center px-6 sm:px-12 lg:px-20 bg-white">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden flex items-center gap-3">
            <Logo size="md" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">FeedFlow</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-base text-slate-500">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
