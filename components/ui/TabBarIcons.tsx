import { Archive, BookOpen, Calendar, Dumbbell, History, House, LayoutDashboard, Library, LibraryBig, Plus, SettingsIcon } from 'lucide-react-native';

const MAPPING = {
    index: LayoutDashboard,
    library: BookOpen,
    history: History,
    settings: SettingsIcon,
    dumbbell: Dumbbell,
    plus: Plus,
    workouts: Calendar
}

export function TabBarIcon({ name, color, size, strokeWidth }: { name: TabBarIconName, color: string, size: number, strokeWidth?: number }) {
    const Icon = MAPPING[name];
    return <Icon color={color} size={size} strokeWidth={strokeWidth} />;
}

export type TabBarIconName = keyof typeof MAPPING;