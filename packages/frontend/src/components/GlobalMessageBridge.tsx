import { useEffect } from 'react';
import { App as AntApp } from 'antd';
import { setGlobalMessageApi } from '../utils/message';

export function GlobalMessageBridge() {
  const { message } = AntApp.useApp();

  useEffect(() => {
    setGlobalMessageApi(message);
    return () => setGlobalMessageApi(null);
  }, [message]);

  return null;
}
