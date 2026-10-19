import { Input } from "@usa-limousine-corporation/ui/components/input";
import type { Schema } from "@/lib/schemas/settings";

type Props = {
  name: keyof Schema;
  label: string;
  hint: string;
  disabled: boolean;
  step?: string;
  min?: string;
  max?: string;
  placeholder?: string;
};

export function SettingsNumberRow(props: Props) {
  const { name, label, hint, disabled, step = "1", min, max, placeholder } = props;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-default-900">{label}</p>
        <p className="mt-0.5 text-xs text-default-500">{hint}</p>
      </div>
      <div className="w-32 shrink-0">
        <Input
          name={name}
          type="number"
          step={step}
          min={min}
          max={max}
          placeholder={placeholder}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
