"use client";

export type SortOption<T extends string> = {
  value: T;
  label: string;
};

type SortSelectProps<T extends string> = {
  value: T;
  options: SortOption<T>[];
  onChange: (value: T) => void;
  label?: string;
};

export default function SortSelect<T extends string>({
  value,
  options,
  onChange,
  label = "Sort by",
}: SortSelectProps<T>) {
  return (
    <div>
      <label
        htmlFor="sort-select"
        className="mb-2 block text-sm text-zinc-400"
      >
        {label}
      </label>

      <select
        id="sort-select"
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-zinc-600"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}