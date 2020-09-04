import React, { MutableRefObject, ChangeEvent, FunctionComponent, FormEvent, useRef, RefObject } from 'react';


interface StepsEditProps {
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
    events: any[],
    patternNoteLength: string | number,
    page: number,
    setNote: (note: string[]) => void,
    setPatternNoteLength: (length: number | string) => void,
    changePage: (pageIndex: number) => void,
    setNoteLength: (noteLength: number | string) => void,
    setVelocity: (velocity: number) => void
}

const StepsEdit: React.FC<StepsEditProps> = ({
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

    const tlRef = useRef<HTMLFormElement>(null);

    const tlInputRef = useRef<HTMLInputElement>(null);

    const plRef = useRef<HTMLFormElement>(null);

    const plInputRef = useRef<HTMLInputElement>(null);

    const noteInRef = useRef<HTMLInputElement>(null);

    const velocityRef = useRef<HTMLInputElement>(null);

    const noteLengthRef = useRef<HTMLInputElement>(null);

    const changePatternNameHandler = (e: FormEvent<HTMLFormElement | undefined>): void => {
        e.preventDefault();
        patternNameInput.current && changePatternName(patternNameInput.current.value);
    };

    const changeTrackLengthHandler = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        let newLength = tlInputRef.current ? tlInputRef.current.valueAsNumber : 0;
        tlRef.current && changeTrackLength(newLength, tlRef);
    };

    const changePatternLengthHandler = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        let newLength = plInputRef.current ? plInputRef.current.valueAsNumber : 0;
        changePatternLength(newLength, plRef)
    };

    const inputNoteForm = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        if (!selected) {
            alert('noStepSelected')
        } else {
            let value: string | string[] = noteInRef.current ? noteInRef.current.value : '';
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
            return events[selected[0]]['note'] ? events[selected[0]]['note'].join(',') : 'noNote';
        } else {
            return 'Input Note';
        }
    };

    const velocityPaceholder = (): string | number => {
        if (selected.length > 1) {
            return 'mais do que um selecionado'
        } else if (selected.length === 1) {
            return events[selected[0]]['velocity'] ? events[selected[0]]['velocity'] : patternTrackVelocity;
        } else {
            return patternTrackVelocity;
        }
    }

    const noteLengthPlaceholder = (): string | number => {
        if (selected.length > 1) {
            return 'mais do que um selecionado'
        } else if (selected.length === 1) {
            return events[selected[0]]['length'] ? events[selected[0]]['length'] : patternNoteLength;
        } else {
            return patternNoteLength;
        }
    }

    return (
        <div>
            <form ref={tlRef} action=""></form>
            <form ref={plRef} action=""></form>
            <input ref={tlInputRef} type="text" />
            <input ref={plInputRef} type="text" />
            <input ref={noteInRef} type="text" />
        </div>
    )
}