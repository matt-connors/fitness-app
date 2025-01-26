import { Dumbbell, History, House, Library, Plus, SettingsIcon } from 'lucide-react-native';

const MAPPING = {
    index: House,
    library: Library,
    history: History,
    settings: SettingsIcon,
    dumbbell: Dumbbell,
    plus: Plus,
}

export function TabBarIcon({ name, color, size, strokeWidth }: { name: TabBarIconName, color: string, size: number, strokeWidth?: number }) {
    const Icon = MAPPING[name];
    return <Icon color={color} size={size} strokeWidth={strokeWidth} />;
}

export type TabBarIconName = keyof typeof MAPPING;