import React from 'react';
import { Archive, BookOpen, Calendar, CalendarFold, Dumbbell, History, House, LayoutDashboard, Library, LibraryBig, Plus, SettingsIcon } from 'lucide-react-native';

const MAPPING = {
    index: LayoutDashboard,
    library: BookOpen,
    history: History,
    settings: SettingsIcon,
    dumbbell: Dumbbell,
    plus: Plus,
    workouts: CalendarFold,
    'active-workout': Dumbbell
}

export function TabBarIcon({ name, color, size, strokeWidth }: { name: TabBarIconName, color: string, size: number, strokeWidth?: number }) {
    const Icon = MAPPING[name];
    if (!Icon) {
        console.warn(`Icon not found for name: ${name}`);
        return null;
    }
    return <Icon color={color} size={size} strokeWidth={strokeWidth} />;
}

export type TabBarIconName = keyof typeof MAPPING;