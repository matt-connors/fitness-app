export interface Exercise {
  id: string;
  name: string;
  allSetsEqual: boolean;
  showRpe: boolean;
  sets?: number;
  reps?: number;
  restPause?: number;
  rpe?: number;
  rir?: number;
  tempo?: number;
  weight?: number;
  showExpanded?: boolean;
  notes?: string;
  // For multiple set case
  multipleSets?: Array<{
    setNumber: number;
    reps?: number;
    restPause?: number;
    rpe?: number;
    rir?: number;
    tempo?: number;
    weight?: number;
    showExpanded?: boolean;
  }>;
}

export interface RoutineData {
  id: string;
  name: string;
  type?: string;
  date?: string;
  duration?: string;
} 