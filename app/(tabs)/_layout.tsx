import { Tabs } from 'expo-router';
// import { Tabs, TabList, TabTrigger, TabSlot } from 'expo-router/ui';
import React from 'react';
import { TabBar } from '@/components/ui/TabBar';
import { Header } from '@/components/ui/Header';
import { View } from 'react-native';

export default function TabLayout() {
    return (
        <View style={{ flex: 1 }}>
            <Header />
            <Tabs
                tabBar={props => <TabBar {...props} />}
                screenOptions={{
                    headerShown: false, 
                }}
            />
        </View>
    );
}
