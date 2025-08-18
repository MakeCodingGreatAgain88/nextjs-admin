declare global {
  interface Window {
    turnstile: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          theme?: 'light' | 'dark';
          language?: string;
        }
      ) => void;
      remove: (container: HTMLElement) => void;
    };
  }
}

export {};
