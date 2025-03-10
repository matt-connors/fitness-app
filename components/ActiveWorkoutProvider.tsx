import React, { createContext, useState, useContext, useEffect } from 'react';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { useRouter } from 'expo-router';

interface ActiveWorkoutProviderProps {
    children: React.ReactNode;
}

interface Workout {
    id: string;
    name: string;
    exercises: Array<any>;
    startTime: Date;
    endTime?: Date;
    elapsedSeconds: number;
    isPaused: boolean;
    lastPauseTime?: Date;
}

interface ActiveWorkoutContextType {
    activeWorkout: Workout | null;
    startNewWorkout: (name?: string) => void;
    stopActiveWorkout: () => void;
    togglePauseWorkout: () => void;
    elapsedTime: string;
    handleWorkoutBarPress: () => void;
    updateWorkoutName: (name: string) => void;
}

const ActiveWorkoutContext = createContext<ActiveWorkoutContextType | undefined>(undefined);

export function ActiveWorkoutProvider({ children }: ActiveWorkoutProviderProps) {
    const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');
    const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const { saveWorkout } = useWorkoutData();

    // Start the workout timer
    const startTimer = () => {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        const interval = setInterval(() => {
            if (activeWorkout && !activeWorkout.isPaused) {
                const now = new Date();
                const startTime = activeWorkout.startTime;
                
                // Calculate total elapsed time
                let totalElapsedSeconds = activeWorkout.elapsedSeconds;
                totalElapsedSeconds += (now.getTime() - (activeWorkout.lastPauseTime || startTime).getTime()) / 1000;
                
                // Update the formatted time string
                const hours = Math.floor(totalElapsedSeconds / 3600);
                const minutes = Math.floor((totalElapsedSeconds % 3600) / 60);
                const seconds = Math.floor(totalElapsedSeconds % 60);
                
                setElapsedTime(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
            }
        }, 1000);
        
        setTimerInterval(interval);
    };

    // Handle when the user taps on the workout bar
    const handleWorkoutBarPress = () => {
        // No need to navigate anymore as we're using a drawer that will be
        // shown from the ActiveWorkoutBar component
    };

    // Pause or resume the workout
    const togglePauseWorkout = () => {
        if (!activeWorkout) return;
        
        setActiveWorkout(prevWorkout => {
            if (!prevWorkout) return null;
            
            const now = new Date();
            if (prevWorkout.isPaused) {
                // Resume - update the last pause time to now
                return { ...prevWorkout, isPaused: false, lastPauseTime: now };
            } else {
                // Pause - add elapsed time since last pause to the total
                const elapsedSinceLastPause = (now.getTime() - (prevWorkout.lastPauseTime || prevWorkout.startTime).getTime()) / 1000;
                return { 
                    ...prevWorkout, 
                    isPaused: true, 
                    elapsedSeconds: prevWorkout.elapsedSeconds + elapsedSinceLastPause 
                };
            }
        });
    };

    // Stop the active workout
    const stopActiveWorkout = () => {
        if (activeWorkout) {
            if (timerInterval) {
                clearInterval(timerInterval);
                setTimerInterval(null);
            }
            
            // Calculate final stats and save
            const now = new Date();
            let finalElapsedSeconds = activeWorkout.elapsedSeconds;
            
            if (!activeWorkout.isPaused) {
                finalElapsedSeconds += (now.getTime() - (activeWorkout.lastPauseTime || activeWorkout.startTime).getTime()) / 1000;
            }
            
            const completedWorkout = {
                ...activeWorkout,
                endTime: now,
                elapsedSeconds: finalElapsedSeconds
            };
            
            // Save the workout to history
            saveWorkout(completedWorkout);
            
            // Reset state
            setActiveWorkout(null);
            setElapsedTime('00:00:00');
        }
    };

    // Start a new workout
    const startNewWorkout = (name = "Quick Workout") => {
        // Create a new workout
        const newWorkout: Workout = {
            id: Date.now().toString(),
            name,
            exercises: [],
            startTime: new Date(),
            elapsedSeconds: 0,
            isPaused: false
        };
        
        setActiveWorkout(newWorkout);
        setElapsedTime('00:00:00');
    };

    // Update the workout name
    const updateWorkoutName = (name: string) => {
        if (activeWorkout) {
            setActiveWorkout({
                ...activeWorkout,
                name
            });
        }
    };

    // Start/stop timer based on workout state
    useEffect(() => {
        if (activeWorkout) {
            startTimer();
        } else if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
        }
        
        return () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        };
    }, [activeWorkout, activeWorkout?.isPaused]);

    return (
        <ActiveWorkoutContext.Provider
            value={{
                activeWorkout,
                startNewWorkout,
                stopActiveWorkout,
                togglePauseWorkout,
                elapsedTime,
                handleWorkoutBarPress,
                updateWorkoutName
            }}
        >
            {children}
        </ActiveWorkoutContext.Provider>
    );
}

export function useActiveWorkout() {
    const context = useContext(ActiveWorkoutContext);
    if (context === undefined) {
        throw new Error('useActiveWorkout must be used within an ActiveWorkoutProvider');
    }
    return context;
} 