import { BottomNavItemId } from './bottom-nav-item-id.type';

export interface BottomNavItemConfig {
  id: BottomNavItemId;
  label: string;
  route: string;
  iconClass: string;
}

export interface BottomNavConfig {
  items: BottomNavItemConfig[];
  selectedItemId: BottomNavItemId;
}
