'use client';

import { type CSSProperties, type ReactNode, useEffect } from 'react';
import { Toaster as SonnerToaster } from 'sonner';

import { showPendingToast } from './toast';

function Icon({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ? `size-5 ${className}` : 'size-5'}
    >
      {children}
    </svg>
  );
}

const icons = {
  success: (
    <Icon className="text-accent">
      <circle cx="10" cy="10" r="7.25" />
      <path d="m6.75 10.25 2.25 2.25 4.25-4.75" />
    </Icon>
  ),
  error: (
    <Icon className="text-danger">
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 6.5v4.25M10 13.5v.01" />
    </Icon>
  ),
  close: (
    <Icon>
      <path d="m5.5 5.5 9 9m0-9-9 9" />
    </Icon>
  ),
};

/** 앱 전역 알림 영역 — 루트 레이아웃에 한 번만 두며 이전 문서가 남긴 알림을 이어서 표시한다 */
export default function Toaster() {
  useEffect(() => {
    showPendingToast();
  }, []);

  return (
    <SonnerToaster
      position="top-center"
      expand
      closeButton
      containerAriaLabel="알림"
      icons={icons}
      offset={{ top: 12 }}
      mobileOffset={{ top: 12, left: 20, right: 20 }}
      style={{ '--width': '28rem' } as CSSProperties}
      toastOptions={{
        unstyled: true,
        closeButtonAriaLabel: '알림 닫기',
        classNames: {
          // sonner가 런타임에 주입하는 스타일은 레이어 밖이라 유틸리티보다 우선하므로 포커스 표시는 !로 지정한다.
          toast:
            'flex w-(--width) items-start gap-3 rounded border bg-surface p-1 pl-4 text-sm text-ink focus-visible:shadow-none! focus-visible:outline-3! focus-visible:outline-offset-4! focus-visible:outline-accent!',
          success: 'border-line',
          error: 'border-danger',
          icon: 'mt-3 shrink-0',
          content: 'min-w-0 flex-1 py-3',
          title: 'text-balance',
          closeButton:
            'order-last flex size-11 shrink-0 items-center justify-center rounded text-muted hover:text-ink',
        },
      }}
    />
  );
}
