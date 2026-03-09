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
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        border: 'none',
        background: 'transparent',
        color: disabled ? '#52525b' : '#d4d4d8',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = '#3f3f46';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

