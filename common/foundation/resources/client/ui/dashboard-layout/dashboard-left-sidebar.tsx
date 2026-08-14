import clsx from 'clsx';
import React, {
  cloneElement,
  forwardRef,
  Fragment,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  useContext,
} from 'react';
import {CustomMenu, CustomMenuProps} from '@common/menus/custom-menu';
import {DashboardSidenavChildrenProps} from '@common/ui/dashboard-layout/dashboard-sidenav';
import {Logo} from '@common/ui/navigation/navbar/logo';
import {DashboardLayoutContext} from '@common/ui/dashboard-layout/dashboard-layout-context';
import {KeyboardArrowLeftIcon} from '@ui/icons/material/KeyboardArrowLeft';
import {KeyboardArrowRightIcon} from '@ui/icons/material/KeyboardArrowRight';
import {useIsDarkMode} from '@ui/themes/use-is-dark-mode';
import {SvgIconProps} from '@ui/icons/svg-icon';
import type {To} from 'react-router';
import {setInLocalStorage} from '@ui/utils/hooks/local-storage';

type MatchDescendants = undefined | boolean | ((to: string) => boolean);

export type DashboardLeftSidebarVariant = 'withoutNavbar' | 'withNavbar';

export interface DashboardLeftSidebarProps
  extends DashboardSidenavChildrenProps {
  matchDescendants?: MatchDescendants;
  menuName: string;
  bottomContent?: ReactNode;
  variant?: DashboardLeftSidebarVariant;
  customMenuRender?: CustomMenuProps['children'];
}
export function DashboardLeftSidebar({
  className,
  isCompactMode = false,
  matchDescendants,
  menuName,
  bottomContent,
  isOverlayMode,
  variant = 'withNavbar',
  customMenuRender,
}: DashboardLeftSidebarProps) {
  const isDarkMode = useIsDarkMode();
  return (
    <div
      className={clsx(
        className,
        isCompactMode ? 'px-6 pt-6' : 'px-12 pt-26',
        'relative flex flex-col gap-20 overflow-y-auto overflow-x-hidden bg-alt pb-16 text-sm font-medium text-muted',
        isOverlayMode && 'border-r',
      )}
    >
      {variant === 'withoutNavbar' && (
        <Fragment>
          <Logo
            color={isDarkMode ? 'light' : 'dark'}
            logoType={isCompactMode ? 'compact' : 'wide'}
            className={isCompactMode ? 'mx-auto mt-12' : 'mb-12'}
            size={isCompactMode ? 'h-34 w-34' : 'h-36'}
          />
          <SidebarToggleButton />
        </Fragment>
      )}

      <CustomMenu
        matchDescendants={matchDescendants}
        menu={menuName}
        orientation="vertical"
        onlyShowIcons={isCompactMode}
        iconSize={isCompactMode ? 'md' : 'sm'}
        gap={isCompactMode ? 'gap-2' : 'gap-4'}
        itemClassName={({isActive}) =>
          dashboardLeftSidebarItemClassName({isActive, isCompactMode})
        }
      >
        {customMenuRender}
      </CustomMenu>
      <div className={clsx('mt-auto space-y-2', isCompactMode && 'mx-auto')}>
        {bottomContent}
      </div>
    </div>
  );
}

function SidebarToggleButton() {
  const {leftSidenavStatus, setLeftSidenavStatus, name} = useContext(
    DashboardLayoutContext,
  );

  const handleToggle = () => {
    const newStatus = leftSidenavStatus === 'open' ? 'compact' : 'open';
    setLeftSidenavStatus(newStatus);
    setInLocalStorage(`${name}.sidenav.compact`, newStatus === 'compact');
  };

  return (
    <button
      className={clsx(
        'fixed bottom-180 z-10 flex select-none appearance-none items-center justify-center rounded-full border bg align-middle outline-none transition-[left,color,shadow] duration-200 hover:text-primary focus-visible:ring',
        leftSidenavStatus === 'open' ? 'left-[212px]' : 'left-48',
      )}
      onClick={() => handleToggle()}
    >
      {leftSidenavStatus === 'open' ? (
        <KeyboardArrowLeftIcon size="sm" />
      ) : (
        <KeyboardArrowRightIcon size="sm" />
      )}
    </button>
  );
}

interface DashboardLeftSidebarItemProps {
  elementType?: 'button' | 'a' | JSXElementConstructor<any>;
  isCompact?: boolean;
  children: [ReactElement<SvgIconProps>, ReactNode, ...ReactNode[]];
  className?: string;
  to?: To;
  target?: '_blank';
}

export const DashboardLeftSidebarItem = forwardRef<
  unknown,
  DashboardLeftSidebarItemProps
>(
  (
    {
      elementType = 'button',
      isCompact = false,
      children: [icon, label, ...otherChildren],
      className,
      target,
      to,
      ...otherProps
    },
    ref,
  ) => {
    const Element = elementType;
    return (
      <Element
        ref={ref}
        {...otherProps}
        target={target}
        to={to}
        className={clsx(
          className,
          'flex',
          isCompact ? 'gap-2' : 'gap-8',
          dashboardLeftSidebarItemClassName({
            isActive: false,
            isCompactMode: isCompact,
          }),
        )}
      >
        {cloneElement(icon, {size: isCompact ? 'md' : 'sm'})}
        {!isCompact && label}
        {otherChildren}
      </Element>
    );
  },
);

export function dashboardLeftSidebarItemClassName({
  isActive,
  isCompactMode,
}: {
  isActive: boolean;
  isCompactMode: boolean;
}) {
  return clsx(
    'rounded-button',
    isCompactMode
      ? 'w-48 h-48 items-center justify-center'
      : 'w-full py-12 px-16 block justify-start',
    isActive ? 'bg-primary/6 text-primary font-semibold' : 'hover:bg-hover',
  );
}
