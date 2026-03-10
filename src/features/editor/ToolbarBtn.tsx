import React from 'react';

type ToolbarBtnProps = {
  title: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
};

export function ToolbarBtn({ title, onClick, disabled, children }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`w-9 h-9 rounded-lg border-none bg-transparent flex items-center justify-center transition-colors duration-150 ${
        disabled
          ? 'text-zinc-600 cursor-not-allowed'
          : 'text-zinc-300 cursor-pointer hover:bg-zinc-700'
      }`}
    >
      {children}
    </button>
  );
}
