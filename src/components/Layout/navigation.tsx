import type { ReactNode } from 'react';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

export interface NavItem {
  label: string;
  /** Rótulo curto da barra inferior no celular */
  shortLabel: string;
  to: string;
  icon: ReactNode;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/** Menu do app: fonte única para sidebar, barra de ícones e barra inferior. */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Visão geral',
    items: [{ label: 'Dashboard', shortLabel: 'Início', to: '/', icon: <SpaceDashboardOutlinedIcon /> }],
  },
  {
    label: 'Finanças',
    items: [
      { label: 'Gestão de Cartão', shortLabel: 'Cartão', to: '/gestao-cartao', icon: <CreditCardOutlinedIcon /> },
      { label: 'Gestão Financeira', shortLabel: 'Finanças', to: '/gestao-financeira', icon: <InsightsOutlinedIcon /> },
    ],
  },
  {
    label: 'Casa',
    items: [{ label: 'Energia Solar', shortLabel: 'Energia', to: '/energia', icon: <WbSunnyOutlinedIcon /> }],
  },
  {
    label: 'Cadastros',
    items: [{ label: 'Pessoas', shortLabel: 'Pessoas', to: '/pessoa', icon: <PeopleAltOutlinedIcon /> }],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find((i) => (i.to === '/' ? pathname === '/' : pathname.startsWith(i.to)));
}
