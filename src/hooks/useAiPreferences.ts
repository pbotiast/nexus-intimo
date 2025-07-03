import { useCallback } from 'react';
import type { Feedback, PreferenceCategory } from '../types';
import { useCouple } from '../contexts/CoupleContext';

export const useAiPreferences = () => {
    const { api, coupleData } = useCouple();

    const recordFeedback = useCallback((category: PreferenceCategory, value: string, feedback: Feedback) => {
        api.recordFeedback({ category, value, feedback }).catch(e => console.error("Failed to record feedback", e));
    }, [api]);

    return { preferences: coupleData?.aiPreferences || {}, recordFeedback };
};
