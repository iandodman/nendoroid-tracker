import AuthStatus from "@/components/auth/AuthStatus";

export default function Header() {
  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
        NendoDex
      </h1>

      <AuthStatus />
    </header>
  );
}