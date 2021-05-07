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
    changeEffect: (effect: effectTypes, trackIndex: number, fxIndex: number) => void,
    addEffect: (effect: effectTypes, trackIndex: number, fxIndex: number) => void, 
    deleteEffect: (fxIndex: number, trackIndex: number) => void;
}