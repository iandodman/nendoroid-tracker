import { signIn } from "@/auth";

type SignInRequiredProps = {
  title: string;
  description: string;
  redirectTo: string;
};

function GoogleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.9-1.75 2.98-4.33 2.98-7.37Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.98-.9 6.64-2.4l-3.24-2.52c-.9.6-2.05.96-3.4.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.6A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.91A6.02 6.02 0 0 1 6.07 12c0-.66.11-1.3.32-1.91v-2.6H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.51l3.35-2.6Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.96c1.47 0 2.79.5 3.83 1.5l2.88-2.88A9.68 9.68 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.35 2.6C7.18 7.72 9.39 5.96 12 5.96Z"
      />
    </svg>
  );
}

export default function SignInRequired({
  title,
  description,
  redirectTo,
}: SignInRequiredProps) {
  const signInWithGoogle = async () => {
    "use server";

    await signIn("google", {
      redirectTo,
    });
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-center">
      <h2 className="text-lg font-semibold text-zinc-50">
        {title}
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-400">
        {description}
      </p>

      <form action={signInWithGoogle} className="mt-6">
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-zinc-50 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-zinc-200 sm:w-auto"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </form>
    </section>
  );
}