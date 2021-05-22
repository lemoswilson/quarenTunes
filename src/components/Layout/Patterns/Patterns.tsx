import React, { useEffect } from 'react';
import { event, Pattern } from '../../../store/Sequencer'
import styles from './style.module.scss';
import Dropdown from '../../UI/Dropdown';
import Plus from '../../UI/Plus';
import Minus from '../../UI/Minus';
import LengthEditor from '../../UI/LengthEditor';
import usePrevious from '../../../hooks/usePrevious';



interface Patterns {
    activePattern: number,
    selected: number[],
    patternLength: string | number,
    patterns: { [key: number]: Pattern }
    trackLength: number,
    changeTrackLength: (newLength: number) => void,
    changePatternLength: (newLength: number) => void,
    addPattern: () => void,
    // selectPattern: (e: ChangeEvent<HTMLInputElement>) => void,
    selectPattern: (key: string) => void,
    removePattern: () => void,
    incDecTrackLength: (amount: number) => void,
    incDecPatLength: (amount: number) => void,
    incDecVelocity: {
        step: (amount: number) => void,
        patternTrack: (amount: number) => void, 
    },
    incDecOffset: (amount: number) => void,
    renamePattern: (name: string) => void,
    patternTrackVelocity: number,
    events: event[],
    note: boolean,
    setOffset: (offset: number) => void,
    setVelocity: {
        step: (amount: number) => void,
        pattTrk: (amount: number) => void,
    }
    isPlay: boolean,
    // setNoteLength: (noteLength: number | string) => void,
}

const Patterns: React.FC<Patterns> = ({
    activePattern,
    isPlay,
    setOffset,
    addPattern,
    renamePattern,
    incDecPatLength,
    incDecTrackLength,
    incDecOffset,
    incDecVelocity,
    changePatternLength,
    changeTrackLength,
    setVelocity,
    patterns,
    patternLength,
    patternTrackVelocity,
    removePattern,
    note,
    events,
    selectPattern,
    selected,
    trackLength,
}) => {
    const previousSelected = usePrevious(selected.length > 0)


    const patternSelectorSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const input = event.currentTarget.getElementsByTagName('input')[0];
        renamePattern(input.value);
    };

    const trackLengthSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const input = event.currentTarget.getElementsByTagName('input')[0];
        let data = Number(trackLength);
        if (Number(input.value) >= 0 && Number(input.value) <= 64) {
            data = Number(input.value);
            changeTrackLength(data);
        };
        input.value = String(data);
        input.blur()
    };

    const patternLengthSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const input = event.currentTarget.getElementsByTagName('input')[0];
        let data = Number(patternLength);
        if (Number(input.value) >= 0 && Number(input.value) <= 64) {
            data = Number(input.value);
            changePatternLength(data);
        };
        input.value = String(data);
        input.blur()
    };

    // fix velocity submit and offset submit 
    const velocitySubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const input = event.currentTarget.getElementsByTagName('input')[0];
        const val = Number(input.value)
        // console.log('submiting velocity, val is', val)

        let data =
            selected.length >=1 && note && selectedVelocities && events[selected[0]].instrument.velocity
            ? Number(events[selected[0]].instrument.velocity)
            : (note && selected.length >= 1 && selectedVelocities && !events[selected[0]].instrument.velocity)
                ? `${patternTrackVelocity} (pattern)`
                : !note   
                    ? trackLength
                    : note && selected.length === 0
                    ? patternTrackVelocity
                    : '*'

        if (val >= 0 && val <= 127) {
            data = Number(input.value);
            selected.length > 0 
                ? setVelocity.step(data) 
                : setVelocity.pattTrk(data)
        };

        input.value = String(data);
        input.blur()
    };

    const offsetSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const input = event.currentTarget.getElementsByTagName('input')[0];
        const val = Number(input.value)

        let data =
            note && selected.length >= 1 && selectedOffset && events[selected[0]].offset
            ? Number(events[selected[0]].offset)
            : note && selected.length >= 1 && selectedOffset && !events[selected[0]].offset
                ? 0
                : !note
                    ? patternLength
                    // : selected.length === 0 && note
                    // ? '*'
                    : '*'

        if (val >= -100 && val <= 100) {
            data = val;
            setOffset(val)
        };

        input.value = String(data);
        input.blur()
    };

    const selectedVelocities = selected
    .map(id => events[id].instrument.velocity)
    .every((val, i, arr) => val === arr[0])

    const selectedOffset = selected
    .map(id => events[id].instrument.offset)
    .every((val, i, arr) => val === arr[0])

    useEffect(() => {

    }, [events, selected])

    const incDecOffPat = (direction: number) => {
        if (note && selected.length > 0)
            incDecOffset(direction)
        // else if (selected.length === 0 && !note)
        else if (!note)
            incDecPatLength(direction)
    }

    const OffPatSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        if (note && selected.length > 0)
            offsetSubmit(event)
        // else if (selected.length === 0 && !note)
        else if (!note)
            patternLengthSubmit(event)
    }

    const incDecVelTrk = (direction: number) => {
        if (note && selected.length > 0)
            incDecVelocity.step(direction)
        // else if (selected.length === 0 && !note)
        else if (!note)
            incDecTrackLength(direction)
        else if (note && selected.length === 0) {
            // console.log('this bug')
            incDecVelocity.patternTrack(direction)
        }
    }

    const VelTrkSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        if (note && selected.length > 0)
            velocitySubmit(event)
        // else if (selected.length === 0 && !note)
        else if (!note)
            trackLengthSubmit(event)
        else if (note && selected.length === 0)
            velocitySubmit(event)
    }


    return (
        <div className={styles.border}>
            <div className={styles.title}>
                <h1>{note ? "Note" : "Patterns"}</h1>
            </div>
            <div className={styles.overlay}>
                <div className={styles.top} style={{ display: note ? 'none' : 'grid' }}>
                    <div className={styles.selector}>
                        <Dropdown
                            forceClose={selected.length === 0 && previousSelected ? true : false}
                            keyValue={Object.keys(patterns).map(k => [String(k), patterns[Number(k)].name])}
                            onSubmit={patternSelectorSubmit}
                            select={selectPattern}
                            renamable={true}
                            dropdownId='patterns'
                            selected={String(activePattern)}
                            className={styles.dropdown}
                        />
                    </div>
                    <div className={styles.increase}>{ !isPlay ? <Plus onClick={() => { addPattern() }} /> : null }</div>
                    <div className={styles.decrease}>{Object.keys(patterns).length > 1 && !isPlay ? < Minus onClick={() => { removePattern() }} /> : null}</div>
                </div>
                <div className={styles.mid} style={{ marginTop: note ? '0' : '1rem' }}>
                    <LengthEditor
                        length={
                            selected.length >=1 && note && selectedVelocities && events[selected[0]].instrument.velocity
                                ? Number(events[selected[0]].instrument.velocity)
                                : (note && selected.length >= 1 && selectedVelocities && !events[selected[0]].instrument.velocity)
                                    ? `${patternTrackVelocity} (pattern)`
                                    : !note   
                                        ? trackLength
                                        : note && selected.length === 0
                                        ? patternTrackVelocity
                                        : '*'
                        }
                        disabled={!note && isPlay}
                        decrease={() => {incDecVelTrk(-1)}}
                        increase={() => {incDecVelTrk(1)}}
                        label={note ? "Vel" : 'Track'}
                        onSubmit={VelTrkSubmit}
                    />
                </div>
                <div className={styles.bottom}>
                    <LengthEditor
                        length={
                            note && selected.length >= 1 && selectedOffset && events[selected[0]].offset
                                ? Number(events[selected[0]].offset)
                                : note && selected.length >= 1 && selectedOffset && !events[selected[0]].offset
                                    ? 0
                                    : !note
                                        ? patternLength
                                        // : selected.length === 0 && note
                                        // ? '*'
                                        : '*'
                        }
                        disabled={(note && selected.length === 0) || !note && isPlay}
                        decrease={() => {incDecOffPat(-1)}}
                        increase={() => {incDecOffPat(1)}}
                        label={ note ? "Offset" : 'Pattern'}
                        onSubmit={OffPatSubmit}
                    />
                </div>
            </div>
        </div>
    )
}

export default Patterns;