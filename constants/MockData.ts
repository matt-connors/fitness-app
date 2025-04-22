// Mock data for different sections
export const RECENT_ROUTINES = [
    { id: 'r1', name: 'Full Body Strength', type: 'Strength', exercises: 12, duration: '45 min', lastUsed: '3 days ago', source: 'user' },
    { id: 'r2', name: 'HIIT Cardio', type: 'Cardio', exercises: null, duration: '30 min', lastUsed: '1 week ago', source: 'platform' },
];

export const USER_CREATED_WORKOUTS = [
    { id: 'u1', name: 'Full Body Strength', type: 'Strength', exercises: 12, duration: '45 min', source: 'user' },
    { id: 'u2', name: 'Upper/Lower Split', type: 'Strength', exercises: 8, duration: '40 min', source: 'user' },
    { id: 'u3', name: 'Push/Pull/Legs', type: 'Strength', exercises: 15, duration: '50 min', source: 'user' },
    { id: 'u4', name: 'Yoga Flow', type: 'Flexibility', exercises: null, duration: '35 min', source: 'user' },
];

// Generate platform workouts
export const generatePlatformWorkouts = (count: number, startIndex: number = 0) => {
    const types = ['Strength', 'Cardio', 'Flexibility', 'Yoga', 'CrossFit', 'HIIT', 'Program'];
    const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
    const baseWorkouts = [
        { name: 'Beginner Strength', type: 'Strength', category: 'Strength' },
        { name: 'HIIT Cardio Blast', type: 'Cardio', category: 'Cardio' },
        { name: 'Advanced Yoga Flow', type: 'Flexibility', category: 'Yoga' },
        { name: 'Core Crusher', type: 'Strength', category: 'Core' },
        { name: '30-Day Transformation', type: 'Program', category: 'Program' },
        { name: 'CrossFit WOD', type: 'CrossFit', category: 'CrossFit' },
        { name: 'Full Body Burn', type: 'HIIT', category: 'HIIT' },
        { name: 'Mobility Flow', type: 'Flexibility', category: 'Mobility' },
        { name: 'Leg Day', type: 'Strength', category: 'Legs' },
        { name: 'Upper Body Focus', type: 'Strength', category: 'Upper Body' },
    ];

    return Array.from({ length: count }).map((_, i) => {
        const index = i + startIndex;
        const base = baseWorkouts[index % baseWorkouts.length];
        const workoutNumber = Math.floor(index / baseWorkouts.length) + 1;
        return {
            id: `platform_${index + 1}_${Date.now()}`,  // Ensure globally unique IDs by adding timestamp
            name: `${base.name}${workoutNumber > 1 ? ' ' + workoutNumber : ''}`,
            type: base.type,
            exercises: Math.floor(Math.random() * 15) + 5,
            duration: `${Math.floor(Math.random() * 40) + 15} min`,
            difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
            category: base.category,
            source: 'platform'
        };
    });
};

// Initial set of platform workouts (equivalent to first page)
export const INITIAL_PLATFORM_WORKOUTS = generatePlatformWorkouts(10, 0);

// Mock data for recent searches
export const RECENT_SEARCHES = [
    { id: 's1', query: 'Full Body', timestamp: '2023-09-15T12:30:00Z' },
    { id: 's2', query: 'HIIT', timestamp: '2023-09-14T10:15:00Z' },
    { id: 's3', query: 'Strength Training', timestamp: '2023-09-12T08:45:00Z' },
];

// Workout types for chips
export const WORKOUT_TYPES = [
    { id: 'all', name: 'All' },
    { id: 'strength', name: 'Strength' },
    { id: 'cardio', name: 'Cardio' },
    { id: 'flexibility', name: 'Flexibility' },
    { id: 'yoga', name: 'Yoga' },
    { id: 'crossfit', name: 'CrossFit' },
    { id: 'hiit', name: 'HIIT' },
    { id: 'program', name: 'Program' },
]; 