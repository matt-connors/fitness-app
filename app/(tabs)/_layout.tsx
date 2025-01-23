import { Tabs } from 'expo-router';
// import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import React from 'react';
import { TabBar } from '@/components/ui/TabBar';

export default function TabLayout() {
    return (
        <Tabs
            tabBar={props => <TabBar {...props} />}
        />
    );
}
