'use client';
import Script from 'next/script';
import { useCallback, useEffect, useRef } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  theme?: 'light' | 'dark';
  language?: string;
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onVerify,
  theme = 'light',
  language = 'zh-CN'
}) => {
  const divRef = useRef<HTMLDivElement>(null);

  const renderWidget = useCallback(() => {
    if (divRef.current && window.turnstile) {
      window.turnstile.render(divRef.current, {
        sitekey: "0x4AAAAAABnuRc3C1pMcouHJ",
        callback: onVerify,
        theme,
        language,
      });
    }
  }, [theme, language, onVerify]);

  useEffect(() => {
    // 只在 turnstile 可用时渲染
    if (window.turnstile) {
      renderWidget();
    }
    const currentRef = divRef.current;
    // 清理函数：组件卸载或依赖项改变时移除 widget
    return () => {
      if (currentRef) {
        window.turnstile?.remove(currentRef);
      }
    };
  }, [renderWidget, theme, language, onVerify]);

  return (<>
    <Script
      src="https://challenges.cloudflare.com/turnstile/v0/api.js"
      onLoad={renderWidget}
    />
    <div ref={divRef} />
  </>);
};

export default TurnstileWidget;
