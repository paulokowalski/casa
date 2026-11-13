import type { ReactNode } from 'react';
import SpaceDashboardOutlinedIcon from '@mui/icons-material/SpaceDashboardOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';

export interface NavItem {
  label: string;
  shortLabel: string;
  to: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

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
    items: [
      { label: 'Pessoas', shortLabel: 'Pessoas', to: '/pessoa', icon: <PeopleAltOutlinedIcon />, adminOnly: true },
    ],
  },
];

export function navegacao(isAdmin: boolean): { sections: NavSection[]; items: NavItem[] } {
  const sections = NAV_SECTIONS.map((s) => ({ ...s, items: s.items.filter((i) => isAdmin || !i.adminOnly) })).filter(
    (s) => s.items.length > 0,
  );
  return { sections, items: sections.flatMap((s) => s.items) };
}

export function findNavItem(items: NavItem[], pathname: string): NavItem | undefined {
  return items.find((i) => (i.to === '/' ? pathname === '/' : pathname.startsWith(i.to)));
}
