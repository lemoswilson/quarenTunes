import { effectTypes, midi } from '../../../store/Track';
import { effectsInitials, effectsInitialsArray } from '../Instruments/types';

export interface effectsProps {
    id: number,
    trackId: number,
    track: number,
    type: effectTypes,
    options: effectsInitialsArray,
    midi: midi,
    index: number,
}