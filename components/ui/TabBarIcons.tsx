import { History, House, Library, SettingsIcon } from 'lucide-react-native';

const MAPPING = {
    index: House,
    library: Library,
    history: History,
    settings: SettingsIcon,
}

export function TabBarIcon({ name, color, size }: { name: TabBarIconName, color: string, size: number }) {
    const Icon = MAPPING[name];
    return <Icon color={color} size={size} />;
}

export type TabBarIconName = keyof typeof MAPPING;