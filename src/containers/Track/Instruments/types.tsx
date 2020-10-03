import { getEffectsInitials, getInitials, getInitialsValue } from '../defaults'
import { instrumentTypes, midi } from '../../../store/Track'

export interface InstrumentProps<T extends instrumentTypes> extends instrumentProps {
    options: initialsArray,
}
interface instrumentProps {
    id: number,
    maxPolyphony?: number,
    midi: midi,
    voice: instrumentTypes
    index: number
    dummy: number,
}

export type newProps = instrumentProps & initialsArray

export type initialsArray = RecursivePartial<ReturnType<typeof getInitials>>
export type initials = RecursivePartial<anyFromObject<ReturnType<typeof getInitials>>>
export type effectsInitialsArray = RecursivePartial<ReturnType<typeof getEffectsInitials>>
export type effectsInitials = RecursivePartial<anyFromObject<ReturnType<typeof getEffectsInitials>>>

// export type recursiveKeys

export type eventOptions = {
    length: number | string,
    velocity: number,
    offset: number,
    note: string[]
} & RecursivePartial<anyFromObject<ReturnType<typeof getInitials>>>


export type anyFromObject<T> = {
    [P in keyof T]: T[P] extends Array<infer U> ? U : T[P] extends object ? anyFromObject<T[P]> : T[P]
};

export declare type RecursivePartial<T> = {
    [P in keyof T]?: T[P] extends Array<infer U> ? Array<RecursivePartial<U>> : T[P] extends object ? RecursivePartial<T[P]> : T[P];
};

export declare type RecursiveFunction<T> = {
    [P in keyof T]?: T[P] extends object ? RecursiveFunction<T[P]> : Function;
};
