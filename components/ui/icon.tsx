import {
  BriefcaseBusiness,
  Check,
  Circle,
  Clock3,
  Droplets,
  Footprints,
  LayoutDashboard,
  ListChecks,
  Menu,
  PackageCheck,
  PanelTop,
  Rows3,
  Search,
  Shirt,
  Sparkle,
  Sparkles,
  Truck,
  UserRound,
  WalletCards,
  Waves,
  X
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  BriefcaseBusiness,
  Check,
  Circle,
  Clock3,
  Droplets,
  Footprints,
  LayoutDashboard,
  ListChecks,
  Menu,
  PackageCheck,
  PanelTop,
  Rows3,
  Search,
  Shirt,
  Sparkle,
  Sparkles,
  Truck,
  UserRound,
  WalletCards,
  Waves,
  X
}

type IconProps = {
  name: string
  className?: string
  'aria-hidden'?: boolean
}

export function Icon({ name, className, ...props }: IconProps) {
  const Component = icons[name] ?? Circle
  return <Component className={className} {...props} />
}
