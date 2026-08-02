import Image from "next/image";

import { auth, signOut } from "@/auth";
import SignInRequired from "@/components/auth/SignInRequired";
import { PageHeader } from "@/components/layout/PageHeader";

export default async function ProfilePage() {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return (
      <>
        <PageHeader
          title="Profile"
          description="Manage your NendoDex account."
        />

        <SignInRequired
          title="Sign in to view your profile"
          description="Your profile contains the account information used to synchronize your collection and wishlist."
          redirectTo="/profile"
        />
      </>
    );
  }

  const displayName =
    user.name ?? user.email ?? "NendoDex user";

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your NendoDex account."
      />

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-center gap-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={displayName}
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xl font-semibold text-zinc-100">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-zinc-50">
              {displayName}
            </h2>

            <p className="mt-1 text-sm text-zinc-400">
              Signed in with Google
            </p>
          </div>
        </div>
      </section>
      <form
        action={async () => {
            "use server";

            await signOut({
            redirectTo: "/",
            });
        }}
        className="mt-4"
        >
        <button
            type="submit"
            className="w-full rounded-xl border border-zinc-700 px-4 py-3 font-semibold text-zinc-100 transition hover:bg-zinc-800"
        >
            Sign out
        </button>
        </form>
    </>
  );
}