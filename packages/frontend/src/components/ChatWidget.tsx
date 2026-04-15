import { lazy, Suspense, useEffect, useState } from 'react';
import { Button, Spin } from 'antd';
import { pendingPromptStore } from '../constants/chat';

const ChatPanel = lazy(() =>
  import('./ChatPanel').then((module) => ({ default: module.ChatPanel }))
);

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  useEffect(() => {
    const handleOpenChat = (event: Event) => {
      const prompt = (event as CustomEvent<string>).detail;
      if (prompt) {
        pendingPromptStore.value = prompt;
      }
      setOpen(true);
      setCurrentSessionId(null);
    };
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  return (
    <>
      {open && (
        <Suspense fallback={<Spin style={{ display: 'block', margin: '40px auto' }} />}>
          <ChatPanel
            currentSessionId={currentSessionId}
            onSessionChange={setCurrentSessionId}
            onClose={() => setOpen(false)}
          />
        </Suspense>
      )}
      <Button
        type="primary"
        shape="circle"
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          fontSize: 22,
          zIndex: 1000,
          boxShadow: '0 4px 16px rgba(22,119,255,.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        🤖
      </Button>
    </>
  );
}
