import React, { ChangeEvent, FormEvent, useRef, RefObject, MutableRefObject } from 'react';
import { event } from '../../store/Sequencer'


interface Patterns {
    activePattern: number,
    selected: number[],
    patternLength: string | number,
    trackLength: string | number,
    patternAmount: number,
    changeTrackLength: (newLength: number, ref: RefObject<HTMLFormElement>) => void,
    changePatternLength: (newLength: number, ref: RefObject<HTMLFormElement>) => void,
    addPattern: () => void,
    selectPattern: (e: ChangeEvent<HTMLInputElement>) => void,
    changePatternName: (name: string) => void,
    removePattern: () => void,
    patternTrackVelocity: number,
    events: event[],
    patternNoteLength: string | number,
    page: number,
    setNote: (note: string[]) => void,
    setPatternNoteLength: (length: number | string) => void,
    changePage: (pageIndex: number) => void,
    setNoteLength: (noteLength: number | string) => void,
    setVelocity: (velocity: number) => void
}

const Patterns: React.FC<Patterns> = ({
    activePattern,
    addPattern,
    changePage,
    changePatternLength,
    changePatternName,
    changeTrackLength,
    patternAmount,
    page,
    patternLength,
    patternTrackVelocity,
    patternNoteLength,
    removePattern,
    events,
    selectPattern,
    selected,
    setNote,
    setNoteLength,
    setPatternNoteLength,
    setVelocity,
    trackLength,
    children
}) => {
    const patternNameInput = useRef<HTMLInputElement>(null);
    const trackLengthRef = useRef<HTMLFormElement>(null);
    const trackLengthInputRef = useRef<HTMLInputElement>(null);
    const patternLengthRef = useRef<HTMLFormElement>(null);
    const patternLengthInputRef = useRef<HTMLInputElement>(null);
    const noteInputRef = useRef<HTMLInputElement>(null); // maybe don't need it, because of keyboard UI implementation
    const velocityRef = useRef<HTMLInputElement>(null);
    const noteLengthRef = useRef<HTMLInputElement>(null);

    const changePatternNameHandler = (e: FormEvent<HTMLFormElement | undefined>): void => {
        e.preventDefault();
        patternNameInput.current && changePatternName(patternNameInput.current.value);
    };

    const changeTrackLengthHandler = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        let newLength = trackLengthInputRef.current ? trackLengthInputRef.current.valueAsNumber : 0;
        trackLengthRef.current && changeTrackLength(newLength, trackLengthRef);
    };

    const changePatternLengthHandler = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        let newLength = patternLengthInputRef.current ? patternLengthInputRef.current.valueAsNumber : 0;
        changePatternLength(newLength, patternLengthRef)
    };

    const inputNoteForm = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!selected) {
            alert('noStepSelected')
        } else {
            let value: string | string[] = noteInputRef.current ? noteInputRef.current.value : '';
            value = value.split(',');
            let newValue = value.map(e => e.trim());
            newValue = newValue[0] === '' ? [] : newValue;
            setNote(newValue);
        }
        e.currentTarget.reset();
    };

    const inputVelocityForm = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!selected) {
            alert('noStepSelected');
        } else {
            let value = velocityRef.current ? velocityRef.current.valueAsNumber : 0;
            setVelocity(value);
        }
    };

    const noteLengthForm = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        let value: string = noteLengthRef.current ? noteLengthRef.current.value : '';
        value = value.trim();
        if (selected.length < 1) {
            setPatternNoteLength(value);
        } else {
            setNoteLength(value);
        }
    };

    // Conditional elements logic
    const rPattern = patternAmount > 1 ? <span onClick={removePattern}>-</span> : null;

    const pageStyle = (index: number): { backgroundColor: string } | undefined => {
        return index === page ? { backgroundColor: 'red' } : undefined;
    };

    const TrkLengthPlaceHolder = trackLength;

    const notePlaceHolder = () => {
        if (selected.length > 1) {
            return '*';
        } else if (selected.length === 1) {
            return events[selected[0]].instrument['note']
                ? events[selected[0]].instrument.note?.join(',')
                : 'noNote';
        } else {
            return 'Input Note';
        }
    };

    const velocityPaceholder = (): string | number => {
        if (selected.length > 1) {
            return 'mais do que um selecionado'
        } else if (selected.length === 1) {
            const v = events[selected[0]].instrument.velocity
            return v ? v : patternTrackVelocity
        } else {
            return patternTrackVelocity;
        }
    }

    const noteLengthPlaceholder = (): string | number => {
        if (selected.length > 1) {
            return 'mais do que um selecionado'
        } else if (selected.length === 1) {
            const l = events[selected[0]].instrument.length
            return l ? l : patternNoteLength
        } else {
            return patternNoteLength;
        }
    }

    return (
        <div>
            <form ref={trackLengthRef} action=""></form>
            <form ref={patternLengthRef} action=""></form>
            <input ref={trackLengthInputRef} type="text" />
            <input ref={patternLengthInputRef} type="text" />
            <input ref={noteInputRef} type="text" />
        </div>
    )
}

export default Patterns;