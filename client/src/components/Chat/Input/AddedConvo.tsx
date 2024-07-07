import type { TConversation, TEndpointOption } from 'librechat-data-provider';
import { useMemo } from 'react';
import type { SetterOrUpdater } from 'recoil';
import useGetSender from '~/hooks/Conversations/useGetSender';

export default function AddedConvo({
  addedConvo,
  setAddedConvo,
}: {
  addedConvo: TConversation | null;
  setAddedConvo: SetterOrUpdater<TConversation | null>;
}) {
  const getSender = useGetSender();
  const title = useMemo(() => {
    const sender = getSender(addedConvo as TEndpointOption);
    return `${sender}`;
  }, [addedConvo, getSender]);

  if (!addedConvo) {
    return null;
  }
  return (
    <div className="flex items-center gap-1 rounded-xl border-2 px-3 py-1">
      <span className="text-token-text-secondary line-clamp-1 flex-1 py-0.5 font-semibold">
        {title}
      </span>
      {/* <button
        className="text-token-text-secondary flex-shrink-0"
        type="button"
        onClick={() => setAddedConvo(null)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
          viewBox="0 0 24 24"
          className="icon-lg"
        >
          <path
            fill="currentColor"
            fillRule="evenodd"
            d="M7.293 7.293a1 1 0 0 1 1.414 0L12 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414L13.414 12l3.293 3.293a1 1 0 0 1-1.414 1.414L12 13.414l-3.293 3.293a1 1 0 0 1-1.414-1.414L10.586 12 7.293 8.707a1 1 0 0 1 0-1.414"
            clipRule="evenodd"
          ></path>
        </svg>
      </button> */}
    </div>
  );
}
