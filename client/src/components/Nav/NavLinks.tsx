import { Menu, Transition } from '@headlessui/react';
import { useGetStartupConfig, useGetUserBalance } from 'librechat-data-provider/react-query';
import { FileText } from 'lucide-react';
import { Fragment, memo, useState } from 'react';
import { useRecoilState } from 'recoil';
import { GearIcon, LinkIcon } from '~/components';
import FilesView from '~/components/Chat/Input/Files/FilesView';
import { UserIcon } from '~/components/svg';
import { useLocalize } from '~/hooks';
import { useAuthContext } from '~/hooks/AuthContext';
import useAvatar from '~/hooks/Messages/useAvatar';
import store from '~/store';
import { cn } from '~/utils/';
import Logout from './Logout';
import NavLink from './NavLink';
import PlanNCredit from './PlanNCredit';
import Settings from './Settings';

function NavLinks() {
  const localize = useLocalize();
  const { user, isAuthenticated } = useAuthContext();
  const { data: startupConfig } = useGetStartupConfig();
  const balanceQuery = useGetUserBalance({
    enabled: !!isAuthenticated && startupConfig?.checkBalance,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showFiles, setShowFiles] = useRecoilState(store.showFiles);

  const avatarSrc = useAvatar(user);

  return (
    <div className="relative pt-2">
      <div className="absolute -top-8 h-8 w-full bg-gradient-to-t from-gray-50/100 via-gray-50/80 to-gray-50/0 dark:from-gray-850/100 dark:via-gray-850/80 dark:to-gray-800/0"></div>
      {startupConfig?.checkBalance &&
        !!balanceQuery.data &&
        !isNaN(parseFloat(balanceQuery?.data?.balance)) && (
          <PlanNCredit balanceQuery={balanceQuery} />
        )}

      <Menu as="div" className="group relative">
        {({ open }) => (
          <>
            <Menu.Button
              className={cn(
                'group-ui-open:bg-gray-100 dark:group-ui-open:bg-gray-700 duration-350 mt-text-sm flex h-auto w-full items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',
                open ? 'bg-gray-100 dark:bg-gray-800' : '',
              )}
              data-testid="nav-user"
            >
              <div className="-ml-0.9 -mt-0.8 h-8 w-8 flex-shrink-0">
                <div className="relative flex">
                  {!user?.avatar && !user?.username ? (
                    <div
                      style={{
                        backgroundColor: 'rgb(121, 137, 255)',
                        width: '32px',
                        height: '32px',
                        boxShadow: 'rgba(240, 246, 252, 0.1) 0px 0px 0px 1px',
                      }}
                      className="relative flex items-center justify-center rounded-full p-1 text-white"
                    >
                      <UserIcon />
                    </div>
                  ) : (
                    <img className="rounded-full" src={user?.avatar || avatarSrc} alt="avatar" />
                  )}
                </div>
              </div>
              <div
                className="mt-2 grow overflow-hidden text-ellipsis whitespace-nowrap text-left text-black dark:text-gray-100"
                style={{ marginTop: '0', marginLeft: '0' }}
              >
                {user?.name || user?.username || localize('com_nav_user')}
              </div>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-110 transform"
              enterFrom="translate-y-2 opacity-0"
              enterTo="translate-y-0 opacity-100"
              leave="transition ease-in duration-100 transform"
              leaveFrom="translate-y-0 opacity-100"
              leaveTo="translate-y-2 opacity-0"
            >
              <Menu.Items className="absolute bottom-full left-0 z-[100] mb-1 mt-1 w-full translate-y-0 overflow-hidden rounded-lg border border-gray-300 bg-white p-1.5 opacity-100 shadow-lg outline-none dark:border-gray-600 dark:bg-gray-700">
                <div className="text-token-text-secondary ml-3 mr-2 py-2 text-sm" role="none">
                  {user?.email || localize('com_nav_user')}
                </div>
                <div className="my-1.5 h-px bg-black/10 dark:bg-white/10" role="none" />
                <Menu.Item as="div">
                  <NavLink
                    svg={() => <FileText className="icon-md" />}
                    text={localize('com_nav_my_files')}
                    clickHandler={() => setShowFiles(true)}
                  />
                </Menu.Item>
                {startupConfig?.helpAndFaqURL !== '/' && (
                  <Menu.Item as="div">
                    <NavLink
                      svg={() => <LinkIcon />}
                      text={localize('com_nav_help_faq')}
                      clickHandler={() => window.open(startupConfig?.helpAndFaqURL, '_blank')}
                    />
                  </Menu.Item>
                )}
                <Menu.Item as="div">
                  <NavLink
                    svg={() => <GearIcon className="icon-md" />}
                    text={localize('com_nav_settings')}
                    clickHandler={() => setShowSettings(true)}
                  />
                </Menu.Item>
                <div className="my-1.5 h-px bg-black/10 dark:bg-white/10" role="none" />
                <Menu.Item as="div">
                  <Logout />
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
      {showFiles && <FilesView open={showFiles} onOpenChange={setShowFiles} />}
      {showSettings && <Settings open={showSettings} onOpenChange={setShowSettings} />}
    </div>
  );
}

export default memo(NavLinks);
