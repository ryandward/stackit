import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Sun, Moon, MoonStar, Check } from 'lucide-react'
import { useTheme, type Theme } from '../theme/useTheme'

const themes: Array<{ id: Theme; label: string; Icon: typeof Sun }> = [
  { id: 'light', label: 'Light', Icon: Sun },
  { id: 'dark', label: 'Dark', Icon: Moon },
  { id: 'midnight', label: 'Midnight', Icon: MoonStar },
]

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const Current = themes.find(t => t.id === theme)?.Icon ?? Sun
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="button button--icon" aria-label="Theme">
        <Current />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="dropdown__content" sideOffset={6} align="end">
          {themes.map(({ id, label, Icon }) => (
            <DropdownMenu.Item
              key={id}
              className="dropdown__item"
              onSelect={() => setTheme(id)}
            >
              <Icon />
              <span>{label}</span>
              {theme === id && <Check className="dropdown__item__check" />}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
