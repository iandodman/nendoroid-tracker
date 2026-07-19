"use client";

export type FilterOption<T extends string> = {
  value: T;
  label: string;
};

type FilterSelectProps<T extends string> = {
  value: T;
  options: FilterOption<T>[];
  onChange: (value: T) => void;
  label?: string;
  id?: string;
};

export default function FilterSelect<T extends string>({
  value,
  options,
  onChange,
  label = "Filter by",
  id = "filter-select",
}: FilterSelectProps<T>) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm text-zinc-400"
      >
        {label}
      </label>

      <select
        id={id}
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