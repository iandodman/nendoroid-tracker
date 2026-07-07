type SummaryCardProps = {
  title: string;
  value: number;
};

export default function SummaryCard({
  title,
  value,
}: SummaryCardProps) {
  return (
    <article className="rounded-2xl bg-zinc-900 p-4">
      <p className="text-sm text-zinc-400">{title}</p>

      <p className="mt-2 text-2xl font-bold">{value}</p>
    </article>
  );
}