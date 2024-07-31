import { getConfigDefaults } from 'librechat-data-provider';
import { useGetStartupConfig } from 'librechat-data-provider/react-query';
import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { ContextType } from '~/common';
import { useMediaQuery } from '~/hooks';
import { useAddedChatContext } from '../../Providers';
import { cn } from '../../utils';
import AddMultiConvo from './AddMultiConvo';
import ExportAndShareMenu from './ExportAndShareMenu';
import AddedConvo from './Input/AddedConvo';
import { EndpointsMenu, HeaderNewChat, ModelSpecsMenu } from './Menus';
import BookmarkMenu from './Menus/BookmarkMenu';

const defaultInterface = getConfigDefaults().interface;

export default function Header() {
  const { conversation: addedConvo, setConversation: setAddedConvo } = useAddedChatContext();
  const { data: startupConfig } = useGetStartupConfig();
  const { navVisible } = useOutletContext<ContextType>();

  const modelSpecs = useMemo(
    () => startupConfig?.modelSpecs?.list?.filter((model) => model.name !== addedConvo?.spec) ?? [],
    [startupConfig, addedConvo],
  );

  // const addedModelSpecs = useMemo(() => startupConfig?.modelSpecs?.list ?? [], [startupConfig]);

  const interfaceConfig = useMemo(
    () => startupConfig?.interface ?? defaultInterface,
    [startupConfig],
  );

  const isSmallScreen = useMediaQuery('(max-width: 768px)');

  return (
    <div className="sticky top-0 z-10 flex h-14 w-full items-center justify-between bg-white p-2 font-semibold dark:bg-gray-800 dark:text-white">
      <div className="hide-scrollbar flex w-full items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          {!navVisible && <HeaderNewChat />}
          {interfaceConfig.endpointsMenu && <EndpointsMenu />}

          {modelSpecs?.length > 0 && !addedConvo ? (
            <ModelSpecsMenu modelSpecs={modelSpecs} />
          ) : (
            <AddedConvo addedConvo={addedConvo} setAddedConvo={setAddedConvo} />
          )}

          <div
            className={cn(
              'overflow-hidden transition-all duration-700',
              addedConvo ? 'max-w-40' : 'max-w-0',
            )}
          >
            <div
              className={cn(
                'min-w-20 transition-all duration-1000',
                addedConvo ? 'visible opacity-100' : 'invisible opacity-0',
              )}
            >
              <ModelSpecsMenu modelSpecs={modelSpecs} />
              {/* {addedConvo && <AddedConvo addedConvo={addedConvo} setAddedConvo={setAddedConvo} />} */}
            </div>
          </div>

          {/* {modelSpecs?.length > 0 && <ModelSpecsMenu modelSpecs={modelSpecs} />} */}
          {/* {addedConvo && <AddedModelSpecsMenu modelSpecs={addedModelSpecs} />} */}
          {/* <HeaderOptions interfaceConfig={interfaceConfig} /> */}
          {/* {interfaceConfig.presets && <PresetsMenu />} */}

          <AddMultiConvo />

          {isSmallScreen && (
            <ExportAndShareMenu
              isSharedButtonEnabled={startupConfig?.sharedLinksEnabled ?? false}
              className="pl-0"
            />
          )}
          <BookmarkMenu />
          <AddMultiConvo />
        </div>
        {!isSmallScreen && (
          <ExportAndShareMenu isSharedButtonEnabled={startupConfig?.sharedLinksEnabled ?? false} />
        )}
      </div>
      {/* Empty div for spacing */}
      <div />
    </div>
  );
}
