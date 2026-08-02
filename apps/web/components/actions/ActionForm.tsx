"use client";

import type { ReactNode } from "react";
import { useTransition } from "react";

import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/toast";
import type { ActionResult } from "@/types/action-result";

type ActionFormProps = {
  action: () => Promise<ActionResult>;
  children: ReactNode;
  className?: string;
};

export default function ActionForm({
  action,
  children,
  className,
}: ActionFormProps) {
  const [isPending, startTransition] =
    useTransition();

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): void {
    event.preventDefault();

    startTransition(async () => {
      const result = await action();

      if (result.success) {
        showSuccessToast(result.message);
      } else {
        showErrorToast(result.message);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={className}
      aria-busy={isPending}
    >
      <fieldset
        disabled={isPending}
        className="contents"
      >
        {children}
      </fieldset>
    </form>
  );
}