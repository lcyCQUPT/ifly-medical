interface MessageApiLike {
  error: (content: string) => void;
}

let messageApi: MessageApiLike | null = null;

export function setGlobalMessageApi(api: MessageApiLike | null) {
  messageApi = api;
}

export function notifyError(text: string) {
  if (messageApi) {
    messageApi.error(text);
    return;
  }

  console.error(text);
}
