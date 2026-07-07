type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  showSubmitButton?: boolean;
};

export default function SearchBar({
  value,
  onChange,
  onSubmit,
  showSubmitButton = false,
}: SearchBarProps) {
  return (
    <section className="mb-6">
      <label className="mb-2 block text-sm text-zinc-400">
        Search catalog
      </label>

      <div className="flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-2 focus-within:border-zinc-600">
        <input
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base outline-none placeholder:text-zinc-500"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onSubmit?.();
            }
          }}
          placeholder="Search by name, number or series"
        />

        {showSubmitButton && (
          <button
            type="button"
            onClick={onSubmit}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-700 text-zinc-100"
            aria-label="Search"
          >
            <span className="text-lg leading-none">⌕</span>
          </button>
        )}
      </div>
    </section>
  );
}