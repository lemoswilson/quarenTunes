import React, { MutableRefObject, useContext, useState, useEffect, useCallback } from 'react';
import styles from './style.module.scss';

import { Arranger as ArrangerType } from '../../store/Arranger';
import { Sequencer as SequencerType } from '../../store/Sequencer';
import { Track as TrackType } from '../../store/Track';

import Div100vh from 'react-div-100vh';
import WebMidiComponent from '../../lib/WebMidi';
import ToneObjects, { ToneObjects as ToneObjectsType, triggs } from '../../context/ToneObjectsContext';

import Arranger from '../../containers/Arranger';
import Track from '../../containers/Track';
import Sequencer from '../../containers/Sequencer';
import Transport from '../../containers/Transport';
import * as Tone from 'tone';
// import ToneContext from '../../context/ToneContext';

import { ToneType } from '../../lib/tone';

export function newPatternObject(
    Tone: ToneType,
    track?: TrackType,
): triggs[] {
    console.log('should be constructing a new pattern object, track is', track);
    if (track)
        return [...Array(track.trackCount).keys()].map((_, trk, __) => ({
            instrument: new Tone.Part(),
            effects: [...Array(track.tracks[trk].fx.length).keys()].map(v => new Tone.Part())
        }))
    else
        return [{instrument: new Tone.Part(), effects: [new Tone.Part()]}]
}

export interface LayoutState {
    arranger?: ArrangerType, 
    sequencer?: SequencerType,
    track?: TrackType,
}

interface LayoutProps  extends LayoutState {
    appRef: MutableRefObject<HTMLDivElement | null>
}


const Layout: React.FC <LayoutProps> = ({
    appRef,
    arranger,
    sequencer,
    track
}) => {
    const [firstRender, setRender] = useState(true);
    const ref_toneObjects = useContext(ToneObjects);
    // const Tone = useContext(ToneContext);


    const getNewPatternObject = useCallback<() => triggs[]>(() => {
        return newPatternObject(Tone, track)

        // if (track)
        //     return Array(track.trackCount).map((_, trk, __) => ({
        //         instrument: new Tone.Part(),
        //         effects: Array(track.tracks[trk].fx.length).map(v => new Tone.Part())
        //     }))
        // else
        //     return [{instrument: new Tone.Part(), effects: [new Tone.Part()]}]

    }, [])

    const initializeArranger = useCallback(() => {
        if (arranger && track){
            const currentSong = arranger.selectedSong;
            const events = arranger.songs[currentSong].events;
            events.forEach(__ => {
                ref_toneObjects.current?.arranger.push(getNewPatternObject())
            })
        } else  {
            ref_toneObjects.current?.arranger.push(getNewPatternObject())
        }
    }, [])

    const initializePattern = useCallback(() => {
        if (sequencer && track) {
            const patterns = sequencer.patterns
            Object.keys(patterns).forEach(pattern => {
                const p = Number(pattern)
                if (ref_toneObjects.current)
                    ref_toneObjects.current.patterns[p] = getNewPatternObject()
            })
        }
    }, [])

    useEffect(() => {
        if (firstRender){
            ref_toneObjects.current = {patterns: {}, tracks:[], arranger: []}
            initializeArranger()
            initializePattern()

            setRender(false)
        }


    }, [])


    return (
        <Div100vh className={styles.app}>
        {
            !firstRender
            ? <div ref={appRef} className={styles.wrapson}>
                <WebMidiComponent/>
                <div className={styles.content}>
                    <div className={styles.top}>
                        <div className={styles.transport}>
                            <Transport/>
                        </div>
                    </div>
                    <div className={styles.gap}></div>
                    <div className={styles.mid}>
                        <div className={styles.arrangerColumn}>
                            <div className={styles.box}>
                                <Arranger />
                            </div>
                        </div>
                        <Track></Track>
                    </div>
                    <Sequencer></Sequencer>
                </div>
            </div>
            : null
        }
    </Div100vh>
    )
}

export default Layout;