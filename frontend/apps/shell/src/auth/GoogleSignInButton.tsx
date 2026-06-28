import { useEffect, useRef } from 'react';
import { appConfig } from '../config';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              width?: number;
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
            },
          ) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

type Props = {
  onCredential: (credential: string) => void;
  disabled?: boolean;
};

export function GoogleSignInButton({ onCredential, disabled }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!appConfig.googleClientId || !containerRef.current || !wrapperRef.current) return;

    const wrapper = wrapperRef.current;
    const container = containerRef.current;

    function initAndRender() {
      if (!window.google || !container) return;
      if (initializedRef.current) return;
      initializedRef.current = true;

      const width = Math.min(400, Math.max(200, wrapper.clientWidth));

      window.google.accounts.id.initialize({
        client_id: appConfig.googleClientId,
        callback: ({ credential }) => {
          onCredential(credential);
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(container, {
        theme: 'outline',
        size: 'large',
        width,
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
      });
    }

    if (window.google) {
      initAndRender();
    } else {
      const script = document.querySelector('script[data-gsi]');
      if (script) {
        script.addEventListener('load', initAndRender);
        return () => script.removeEventListener('load', initAndRender);
      }
    }
  }, [onCredential]);

  if (!appConfig.googleClientId) return null;

  return (
    <div
      ref={wrapperRef}
      className={`w-full${disabled ? ' pointer-events-none opacity-50' : ''}`}
    >
      <div ref={containerRef} />
    </div>
  );
}
