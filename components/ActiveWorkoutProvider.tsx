import React, { createContext, useState, useContext, useEffect } from 'react';
import { useWorkoutData } from '@/hooks/useWorkoutData';
import { useRouter } from 'expo-router';
import { useMutation } from '@apollo/client';
import { CREATE_SESSION, UPDATE_SESSION } from '@/lib/graphql/mutations';
import { Alert } from 'react-native';

interface ActiveWorkoutProviderProps {
    children: React.ReactNode;
}

interface Workout {
    id: string;
    sessionId?: number; // Backend session ID
    name: string;
    exercises: Array<any>;
    startTime: Date;
    endTime?: Date;
    elapsedSeconds: number;
    isPaused: boolean;
    lastPauseTime?: Date;
    routineId?: number; // Optional reference to a routine
}

interface ActiveWorkoutContextType {
    activeWorkout: Workout | null;
    startNewWorkout: (name?: string, routineId?: number) => void;
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
    const [timerInterval, setTimerInterval] = useState<number | null>(null);
    const router = useRouter();
    const { saveWorkout } = useWorkoutData();

    // GraphQL mutations
    const [createSession, { loading: createSessionLoading }] = useMutation(CREATE_SESSION);
    const [updateSession, { loading: updateSessionLoading }] = useMutation(UPDATE_SESSION);

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
    const stopActiveWorkout = async () => {
        if (activeWorkout) {
            if (timerInterval) {
                clearInterval(timerInterval);
                setTimerInterval(null);
            }
            
            // Calculate final stats 
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
            
            // Save the workout to local history
            saveWorkout(completedWorkout);
            
            // Update session in backend if we have a session ID
            if (activeWorkout.sessionId) {
                try {
                    await updateSession({
                        variables: {
                            id: parseInt(activeWorkout.sessionId.toString(), 10),
                            duration: Math.round(finalElapsedSeconds),
                            name: activeWorkout.name
                        }
                    });
                } catch (error) {
                    console.error('Error updating session:', error);
                    Alert.alert('Error', 'Failed to save workout data to the server');
                }
            }
            
            // Reset state
            setActiveWorkout(null);
            setElapsedTime('00:00:00');
        }
    };

    // Start a new workout
    const startNewWorkout = async (name = "Quick Workout", routineId?: number) => {
        try {
            // Create a session in the backend first
            const { data } = await createSession({
                variables: {
                    name,
                    routineId: routineId ? parseInt(routineId.toString(), 10) : null,
                    date: new Date().toISOString()
                }
            });
            
            if (!data || !data.createSession) {
                throw new Error('Failed to create session');
            }
            
            // Create a new workout with the session ID
            const newWorkout: Workout = {
                id: Date.now().toString(),
                sessionId: data.createSession.id,
                name,
                routineId,
                exercises: [],
                startTime: new Date(),
                elapsedSeconds: 0,
                isPaused: false
            };
            
            setActiveWorkout(newWorkout);
            setElapsedTime('00:00:00');
        } catch (error) {
            console.error('Error creating session:', error);
            Alert.alert(
                'Error', 
                'Failed to create workout session. Starting offline workout instead.',
                [
                    { 
                        text: 'OK',
                        onPress: () => {
                            // Fallback to local workout without server sync
                            const newWorkout: Workout = {
                                id: Date.now().toString(),
                                name,
                                routineId,
                                exercises: [],
                                startTime: new Date(),
                                elapsedSeconds: 0,
                                isPaused: false
                            };
                            
                            setActiveWorkout(newWorkout);
                            setElapsedTime('00:00:00');
                        }
                    }
                ]
            );
        }
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