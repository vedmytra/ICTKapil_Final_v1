export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ember-radial p-6">
      <div className="w-full max-w-[380px]">
        <div className="mb-7 flex items-center justify-center gap-2.5">
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-[#ff9d5c] font-mono text-[15px] font-bold text-bg-1">
            IK
          </div>
          <span className="text-[21px] font-extrabold tracking-tight">
            Ict<span className="text-accent">Kapil</span>
          </span>
        </div>
        <div className="glass-card rounded-[24px] p-7">{children}</div>
      </div>
    </div>
  );
}
