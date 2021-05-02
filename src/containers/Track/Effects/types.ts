import { effectTypes, midi } from '../../../store/Track';
import { effectsInitials, effectsInitialsArray } from '../Instruments/types';

export interface effectsProps {
    fxId: number,
    trackId: number,
    trackIndex: number,
    type: effectTypes,
    options: effectsInitialsArray,
    midi: midi,
    fxIndex: number,
}