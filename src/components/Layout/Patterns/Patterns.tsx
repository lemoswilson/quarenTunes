import React, { useEffect } from 'react';
import { event, Pattern } from '../../../store/Sequencer'
import styles from './style.module.scss';
import Dropdown from '../../UI/Dropdown';
import Plus from '../../UI/Plus';
import Minus from '../../UI/Minus';
import NumberEditor from '../../UI/LengthEditor';
import usePrevious from '../../../hooks/lifecycle/usePrevious';
import { SequencerDispatchers } from '../../../hooks/store/Sequencer/useSequencerDispatchers';

interface Patterns {
    activePattern: number,
    selected: number[],
    patternLength: string | number,
    patterns: { [key: number]: Pattern }
    trackLength: number,
    sequencerDispatchers: SequencerDispatchers,
    patternTrackVelocity: number,
    events: event[],
    note: boolean,
    isPlay: boolean,
}

const Patterns: React.FC<Patterns> = ({
    activePattern,
    isPlay,
    patterns,
    patternLength,
    patternTrackVelocity,
    note,
    events,
    selected,
    trackLength,
    sequencerDispatchers,
}) => {
    const previousSelected = usePrevious(selected.length > 0)


    const patternSelectorSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const input = event.currentTarget.getElementsByTagName('input')[0];
        sequencerDispatchers._renamePattern(input.value);
    };

    const trackLengthSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const input = event.currentTarget.getElementsByTagName('input')[0];
        let data = Number(trackLength);
        if (Number(input.value) >= 0 && Number(input.value) <= 64) {
            data = Number(input.value);
            sequencerDispatchers._changeTrkLength(data) 
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
            sequencerDispatchers._changePattLen(data);
        };
        input.value = String(data);
        input.blur()
    };

    function velocityOrLengthData(){

        if (
            selected.length >=1 && note 
            && selectedVelocities 
            && events[selected[0]].instrument.velocity
        ) 
            return Number(events[selected[0]].instrument.velocity)
        
        else if (
            note && selected.length >= 1 
            && selectedVelocities 
            && !events[selected[0]].instrument.velocity
        )
            return `${patternTrackVelocity} (pattern)`
        
        else if (!note)
            return trackLength
        
        else if (note && selected.length === 0)
            return patternTrackVelocity

        else return '*'
        
    }

    function offsetOrLengthData(){

        if (
            note && selected.length >= 1 
            && selectedOffset 
            && events[selected[0]].offset
        )
            return Number(events[selected[0]].offset)
        
        else if (
            note && selected.length >= 1 
            && selectedOffset 
            && !events[selected[0]].offset
        )
            return 0
        
        else if (!note) return patternLength

        else return '*'

    }

    // fix velocity submit and offset submit 
    const velocitySubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const input = event.currentTarget.getElementsByTagName('input')[0];
        const val = Number(input.value)
        let data = velocityOrLengthData()

        if (val >= 0 && val <= 127) {
            data = Number(input.value);

            selected.length > 0 
            ? sequencerDispatchers._setVelocity(data) 
            : sequencerDispatchers._setPattTrkVelocity(data) 
        };

        input.value = String(data);
        input.blur()
    };

    const offsetSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        const input = event.currentTarget.getElementsByTagName('input')[0];
        const val = Number(input.value)
        let data = offsetOrLengthData()

        if (val >= -100 && val <= 100) {
            data = val;
            sequencerDispatchers._setOffset(val)
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
            sequencerDispatchers._incDecOffset(direction)
        else if (!note)
            sequencerDispatchers._incDecPattLen(direction) 
    }

    const OffPatSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        if (note && selected.length > 0)
            offsetSubmit(event)
        else if (!note)
            patternLengthSubmit(event)
    }

    const incDecVelTrk = (direction: number) => {
        if (note && selected.length > 0)
            sequencerDispatchers._incDecStepVelocity(direction)
        else if (!note)
            sequencerDispatchers._incDecTrkLen(direction) 
        else if (note && selected.length === 0) {
            sequencerDispatchers._incDecPattTrkVelocity(direction) 
        }
    }

    const VelTrkSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        if (note && selected.length > 0)
            velocitySubmit(event)
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
                            onSubmit={patternSelectorSubmit}
                            select={ sequencerDispatchers._selectPatt}
                            renamable={true}
                            dropdownId='patterns'
                            selected={String(activePattern)}
                            className={styles.dropdown}
                            keyValue={Object.keys(patterns).map(
                                k => [String(k), patterns[Number(k)].name])
                            }
                        />
                    </div>
                    <div className={styles.increase}>
                        { !isPlay ? <Plus onClick={sequencerDispatchers._addPatt} /> : null }
                    </div>
                    <div className={styles.decrease}>
                        {
                            Object.keys(patterns).length > 1 && !isPlay 
                            ? < Minus onClick={sequencerDispatchers._removePatt} /> 
                            : null
                        }
                    </div>
                </div>
                <div className={styles.mid} style={{ marginTop: note ? '0' : '1rem' }}>
                    <NumberEditor
                        value={velocityOrLengthData()}
                        disabled={!note && isPlay}
                        decrease={() => {incDecVelTrk(-1)}}
                        increase={() => {incDecVelTrk(1)}}
                        label={note ? "Vel" : 'Track'}
                        onSubmit={VelTrkSubmit}
                    />
                </div>
                <div className={styles.bottom}>
                    <NumberEditor
                        value={offsetOrLengthData()}
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