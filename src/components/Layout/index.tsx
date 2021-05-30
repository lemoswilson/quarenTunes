import React, { MutableRefObject, useContext, useState, useEffect, useCallback } from 'react';
import styles from './style.module.scss';

import { Sequencer as SequencerType } from '../../store/Sequencer';
import { Track as TrackType } from '../../store/Track';

import Div100vh from 'react-div-100vh';
import ToneObjects, { ToneObjects as ToneObjectsType, triggs } from '../../context/ToneObjectsContext';

import TrackComponent from '../../containers/Track';
import Sequencer from '../../containers/Sequencer';
import Transport from '../../containers/Transport';
import * as Tone from 'tone';
import useWebMidi from '../../hooks/store/Midi/useWebMidi';
import useTrackEmitter from '../../hooks/emitters/useTrackEmitter';
import useTriggEmitter from '../../hooks/emitters/useTriggEmitter';
import MenuContext from '../../context/MenuContext';
import useMenuEmitter from '../../hooks/emitters/useMenuEmitter';
import useDropdownEmitter from '../../hooks/emitters/useDropdownEmitter';
import DropdownContext from '../../context/DropdownContext';
import Chain from '../../lib/Tone/fxChain';
import { returnEffect, returnInstrument, reconnect } from '../../lib/Tone/initializers';
import { getInitials } from '../../containers/Track/defaults';
import { useSelector } from 'react-redux';
import { trackSelector } from '../../store/Track/selectors';

type ToneType = typeof Tone;


export function newPatternObject(
    Tone: ToneType,
    track?: TrackType,
): triggs[] {

    if (track)
        return [...Array(track.trackCount).keys()].map((_, trk, __) => ({
            instrument: new Tone.Part(),
            effects: [...Array(track.tracks[trk].fx.length).keys()].map(v => new Tone.Part())
        }))
    else
        return [{instrument: new Tone.Part(), effects: [new Tone.Part()]}]

}

export interface LayoutState {
    sequencer?: SequencerType,
    track?: TrackType,
}

interface LayoutProps  extends LayoutState {
    appRef: MutableRefObject<HTMLDivElement | null>
}


const Layout: React.FC <LayoutProps> = ({
    appRef,
    sequencer,
    track
}) => {
    const [firstRender, setRender] = useState(true);
    const ref_toneObjects = useContext(ToneObjects);
    const ref_menus = useContext(MenuContext);
    const ref_dropdowns = useContext(DropdownContext);
    const Track = useSelector(trackSelector)


    const getNewPatternObject = useCallback<() => triggs[]>(() => {
        return newPatternObject(Tone, track)

    }, [])

    const initializeTracks = () => {
        let t: TrackType;

        if (sequencer && track){
            t = track;

        } else {
            t = Track;
        }

        t?.tracks.forEach((track, trackIndex, _) => {
            ref_toneObjects.current?.tracks.push({
                chain: new Chain(), 
                instrument: returnInstrument(track.instrument, getInitials(track.instrument)),
                effects: [...Array(track.fx.length).keys()].map((__, fxIndex, _) => returnEffect(track.fx[fxIndex].fx, track.fx[fxIndex].options))
            })
            reconnect(ref_toneObjects, trackIndex);
        })
    };

    const initializePattern = useCallback(() => {
        console.log('should be initiating patterns')
        if (sequencer && track) {
            const patterns = sequencer.patterns
            Object.keys(patterns).forEach(pattern => {
                const p = Number(pattern)
                if (ref_toneObjects.current)
                    ref_toneObjects.current.patterns[p] = getNewPatternObject()
            })
        } else {
            if (ref_toneObjects.current)
                ref_toneObjects.current.patterns[0] = getNewPatternObject();
        }
        console.log('should have a pattern object in the patterns, thing is ', ref_toneObjects.current?.patterns)


        // just for testing 

        if (ref_toneObjects.current)
        Object.keys(ref_toneObjects.current.patterns).forEach(p => {
            ref_toneObjects.current?.patterns[Number(p)].forEach(trigg => {
                trigg.instrument.stop(0)
                trigg.effects.forEach(effectTrigg => {
                    effectTrigg.stop(0);
                })
            })
        })
    }, [])

    const initializeFlags = useCallback(() => {
        console.log('should be initializing flags;')
        if (track){
            track.tracks.forEach((__, idx, _) => {
                ref_toneObjects.current?.flagObjects.push({
                    instrument: {callback: undefined, flag: false}, 
                    effects: [...Array(track.tracks[idx].fx.length).keys()].map(v => ({callback: undefined, flag: false}))
                })
            })
        } else {
            ref_toneObjects.current?.flagObjects.push({
                instrument: { callback: undefined, flag: false},
                effects: [{callback: undefined, flag: false}]
            })
        }
    }, [])

    useEffect(() => {
        if (firstRender){
            ref_toneObjects.current = {patterns: {}, tracks:[], flagObjects: []}
            // initializeArranger()
            initializePattern()
            initializeFlags()
            initializeTracks()
            setRender(false)
        }


    }, [])

    useWebMidi();
    useTrackEmitter(ref_toneObjects);
    useTriggEmitter(ref_toneObjects);
    useDropdownEmitter(ref_dropdowns);
    useMenuEmitter(ref_menus)
    


    return (
        <Div100vh className={styles.app}>
        {
            !firstRender
            ? <div ref={appRef} className={styles.wrapson}>
                <div className={styles.content}>
                    <div className={styles.top}>
                        <div className={styles.transport}>
                            <Transport/>
                        </div>
                    </div>
                    <div className={styles.gap}></div>
                    <div className={styles.mid}>
                        <TrackComponent></TrackComponent>
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