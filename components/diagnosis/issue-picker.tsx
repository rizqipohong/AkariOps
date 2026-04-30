"use client";

import { useLanguage } from "@/components/ui/language-provider";
import { issueOptions } from "@/lib/i18n";
import type { IssueType } from "@/types/diagnosis";
import { cn } from "@/lib/utils";

type IssuePickerProps = {
  value: IssueType;
  onChange: (value: IssueType) => void;
  disabled?: boolean;
};

export function IssuePicker({ value, onChange, disabled = false }: IssuePickerProps) {
  const { language } = useLanguage();
  const options = issueOptions(language);

  return (
    <div className="issue-grid">
      {options.map((option) => (
        <button
          key={option.value}
          className={cn("issue-card", value === option.value && "issue-card-active")}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          disabled={disabled}
        >
          <strong>{option.title}</strong>
          <span>{option.description}</span>
        </button>
      ))}
    </div>
  );
}
