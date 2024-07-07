import type { TConversation } from 'librechat-data-provider';
import { isAssistantsEndpoint } from 'librechat-data-provider';
import { CircleOff, Columns2 } from 'lucide-react';
import { Fragment } from 'react';
import { useAddedChatContext, useChatContext } from '~/Providers';
import { mainTextareaId } from '~/common';
import { cn } from '~/utils';

function AddMultiConvo({ className = '' }: { className?: string }) {
  const { conversation } = useChatContext();
  const { setConversation: setAddedConvo, conversation: addedConvo } = useAddedChatContext();

  const clickHandler = () => {
    if (addedConvo) {
      setAddedConvo(null);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { title: _t, ...convo } = conversation ?? ({} as TConversation);
    setAddedConvo({
      ...convo,
      title: '',
    });

    const textarea = document.getElementById(mainTextareaId);
    if (textarea) {
      textarea.focus();
    }
  };

  if (!conversation) {
    return null;
  }

  if (isAssistantsEndpoint(conversation.endpoint)) {
    return null;
  }

  return (
    <button
      onClick={clickHandler}
      className={cn(
        'group flex w-fit cursor-pointer items-center rounded p-2 text-sm hover:bg-border-medium focus-visible:bg-border-medium focus-visible:outline-0',
        className,
      )}
    >
      {!addedConvo ? (
        <Fragment>
          <Columns2 size={20} />
          <span className="ml-1 font-medium">Dual AI</span>
        </Fragment>
      ) : (
        <Fragment>
          <CircleOff size={16} />
          <span className="ml-1 font-medium">Single AI</span>
        </Fragment>
      )}
    </button>
  );
}

export default AddMultiConvo;
