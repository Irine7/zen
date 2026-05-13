import React from 'react';

interface Props {
  password: string;
}

export const PasswordRequirements = ({ password }: Props) => {
  return (
    <div className="mt-2 space-y-1 text-xs">
      <p className={password.length >= 8 ? "text-emerald-500" : "text-zinc-500"}>
        ✓ Минимум 8 символов
      </p>
      <p className={/[0-9]/.test(password) ? "text-emerald-500" : "text-zinc-500"}>
        ✓ Хотя бы одна цифра
      </p>
      <p className={/[!@#$%^&*]/.test(password) ? "text-emerald-500" : "text-zinc-500"}>
        ✓ Спецсимвол (!@#$%^&*)
      </p>
    </div>
  );
};