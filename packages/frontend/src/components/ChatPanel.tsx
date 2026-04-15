import { useRef, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Button, Input, List, Typography, Spin, Tooltip, Empty } from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  CloseOutlined,
  PaperClipOutlined,
  SendOutlined,
} from '@ant-design/icons';
import type { ChatMessage, ChatSession } from '@ifly-medical/shared';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSessions, useSessionMessages, useSendMessage, useDeleteSession } from '../api/chat';
import { useProfile } from '../api/profile';
import { QUICK_PROMPTS, pendingPromptStore } from '../constants/chat';

const { Text } = Typography;

const markdownComponents = {
  p: ({ children }: { children?: ReactNode }) => <p style={{ margin: 0 }}>{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => (
    <ul style={{ paddingLeft: 16, margin: '4px 0' }}>{children}</ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol style={{ paddingLeft: 16, margin: '4px 0' }}>{children}</ol>
  ),
  code: ({ children }: { children?: ReactNode }) => (
    <code
      style={{
        background: 'rgba(0,0,0,.06)',
        borderRadius: 3,
        padding: '0 4px',
        fontSize: '0.92em',
      }}
    >
      {children}
    </code>
  ),
};

interface Props {
  currentSessionId: string | null;
  onSessionChange: (id: string | null) => void;
  onClose: () => void;
}

export function ChatPanel({ currentSessionId, onSessionChange, onClose }: Props) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessions = [] } = useSessions();
  const { data: messages = [] } = useSessionMessages(currentSessionId ?? undefined);
  const { data: profile } = useProfile();
  const sendMessage = useSendMessage();
  const deleteSession = useDeleteSession();

  const pendingMessage =
    sendMessage.isPending && sendMessage.variables?.sessionId === currentSessionId
      ? sendMessage.variables.content
      : null;

  const displayMessages: Array<ChatMessage | { id: string; role: string; content: string; pending: true }> =
    useMemo(
      () =>
        pendingMessage
          ? [...messages, { id: 'pending-user', role: 'user', content: pendingMessage, pending: true as const }]
          : messages,
      [messages, pendingMessage]
    );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages, sendMessage.isPending]);

  useEffect(() => {
    if (pendingPromptStore.value) {
      setInput(pendingPromptStore.value);
      pendingPromptStore.value = null;
    }
  }, []);

  useEffect(() => {
    if (currentSessionId === null && pendingPromptStore.value) {
      setInput(pendingPromptStore.value);
      pendingPromptStore.value = null;
    }
  }, [currentSessionId]);

  function handleNewSession(nextInput = '') {
    onSessionChange(crypto.randomUUID());
    setInput(nextInput);
  }

  function handleAttachProfile() {
    if (!profile) return;
    const parts = [
      profile.name ? `姓名：${profile.name}` : '',
      profile.bloodType ? `血型：${profile.bloodType}` : '',
      profile.allergies ? `过敏史：${profile.allergies}` : '',
      profile.chronicDiseases ? `慢性病：${profile.chronicDiseases}` : '',
    ].filter(Boolean);
    if (parts.length > 0) {
      setInput((prev) => `[我的健康档案]\n${parts.join('  ')}\n\n${prev}`);
    }
  }

  function handleSend() {
    const content = input.trim();
    if (!content) return;
    const sessionId = currentSessionId ?? crypto.randomUUID();
    if (!currentSessionId) onSessionChange(sessionId);
    setInput('');
    sendMessage.mutate({ sessionId, content });
  }

  function handleDeleteSession(sessionId: string) {
    deleteSession.mutate(sessionId, {
      onSuccess: () => {
        if (currentSessionId === sessionId) {
          onSessionChange(null);
        }
      },
    });
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 88,
        right: 24,
        width: 620,
        height: 520,
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        zIndex: 999,
      }}
    >
      <div
        style={{
          background: '#1677ff',
          color: '#fff',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Text strong style={{ color: '#fff', fontSize: 15 }}>
          🤖 AI 健康助手
        </Text>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title="新对话">
            <Button
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleNewSession()}
              style={{ color: '#fff', background: 'transparent', border: '1px solid rgba(255,255,255,.5)' }}
            />
          </Tooltip>
          <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={onClose}
            style={{ color: '#fff', background: 'transparent', border: '1px solid rgba(255,255,255,.5)' }}
          />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <div
          style={{
            width: 180,
            borderRight: '1px solid #f0f0f0',
            overflowY: 'auto',
            background: '#fafafa',
            flexShrink: 0,
          }}
        >
          {sessions.length === 0 ? (
            <div style={{ padding: 16, color: '#999', fontSize: 12, textAlign: 'center' }}>
              暂无历史会话
            </div>
          ) : (
            <List<ChatSession>
              dataSource={sessions}
              renderItem={(s) => (
                <List.Item
                  key={s.sessionId}
                  style={{
                    padding: '8px 10px 8px 12px',
                    cursor: 'pointer',
                    background: currentSessionId === s.sessionId ? '#e6f4ff' : 'transparent',
                    borderLeft: currentSessionId === s.sessionId ? '3px solid #1677ff' : '3px solid transparent',
                  }}
                  onClick={() => onSessionChange(s.sessionId)}
                  actions={[
                    <DeleteOutlined
                      key="del"
                      style={{ color: '#ff4d4f', fontSize: 12 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(s.sessionId);
                      }}
                    />,
                  ]}
                >
                  <div style={{ overflow: 'hidden', width: '100%' }}>
                    <Text ellipsis style={{ fontSize: 11, color: '#555', display: 'block' }}>
                      {s.lastMessage || '新对话'}
                    </Text>
                    <Text style={{ fontSize: 10, color: '#bbb' }}>
                      {new Date(s.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
            {!currentSessionId ? (
              <Empty
                description="选择历史会话或点击「新对话」开始"
                style={{ marginTop: 60 }}
              >
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {QUICK_PROMPTS.map((prompt) => (
                    <Button
                      key={prompt}
                      type="default"
                      size="small"
                      onClick={() => handleNewSession(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </Empty>
            ) : displayMessages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', marginTop: 60, fontSize: 13 }}>
                发送消息开始对话
              </div>
            ) : (
              displayMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      maxWidth: '75%',
                      padding: '8px 12px',
                      borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                      background: msg.role === 'user' ? '#1677ff' : '#f0f0f0',
                      color: msg.role === 'user' ? '#fff' : '#333',
                      fontSize: 13,
                      lineHeight: 1.6,
                      wordBreak: 'break-word',
                    }}
                  >
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    )}
                  </div>
                </div>
              ))
            )}
            {sendMessage.isPending && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
                <div style={{ background: '#f0f0f0', borderRadius: '12px 12px 12px 2px', padding: '8px 16px' }}>
                  <Spin size="small" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: '8px 12px',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-end',
              flexShrink: 0,
            }}
          >
            <Tooltip title={profile ? '附上我的健康档案' : '请先填写个人档案'}>
              <Button
                size="small"
                icon={<PaperClipOutlined />}
                onClick={handleAttachProfile}
                disabled={!profile}
                style={{ flexShrink: 0 }}
              />
            </Tooltip>
            <Input.TextArea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入问题… (Shift+Enter 换行，Enter 发送)"
              autoSize={{ minRows: 1, maxRows: 4 }}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={sendMessage.isPending}
              disabled={!input.trim()}
              style={{ flexShrink: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
