type PageHeaderProps = {
  title: string;
  description?: string;
};

export function PageHeader({
  title,
  description,
}: PageHeaderProps) {
  return (
    <header className="mb-6 space-y-1">
      <h1 className="text-2xl font-bold text-[#fb588c]">
        {title}
      </h1>

      {description && (
        <p className="text-sm text-zinc-400">
          {description}
        </p>
      )}
    </header>
  );
}