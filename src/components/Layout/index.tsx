import React, { MutableRefObject, useContext, useState, useEffect, useCallback } from 'react';
import styles from './style.module.scss';

import { Arranger as ArrangerType } from '../../store/Arranger';
import { Sequencer as SequencerType } from '../../store/Sequencer';
import { Track as TrackType } from '../../store/Track';

import Div100vh from 'react-div-100vh';
import WebMidiComponent from '../Ghosts/WebMidi';
import ToneObjects, { ToneObjects as ToneObjectsType, triggs } from '../../context/ToneObjectsContext';

import Arranger from '../../containers/Arranger';
import Track from '../../containers/Track';
import Sequencer from '../../containers/Sequencer';
import Transport from '../../containers/Transport';
import * as Tone from 'tone';
import useWebMidi from '../../hooks/store/useWebMidi';
import useTrackEmitter from '../../hooks/emitters/useTrackEmitter';
import useTriggEmitter from '../../hooks/emitters/useTriggEmitter';
import MenuContext from '../../context/MenuContext';
import useMenuEmitter from '../../hooks/emitters/useMenuEmitter';
import useDropdownEmitter from '../../hooks/emitters/useDropdownEmitter';
import DropdownContext from '../../context/DropdownContext';

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
    const ref_menus = useContext(MenuContext);
    const ref_dropdowns = useContext(DropdownContext);


    const getNewPatternObject = useCallback<() => triggs[]>(() => {
        return newPatternObject(Tone, track)

    }, [])

    const initializeArranger = useCallback(() => {
        console.log('should be initiating arranger');
        if (arranger && track){
            const currentSong = arranger.selectedSong;
            const events = arranger.songs[currentSong].events;
            events.forEach(__ => {
                ref_toneObjects.current?.arranger.push(getNewPatternObject())
            })
        } else  {
            ref_toneObjects.current?.arranger.push(getNewPatternObject())
        }
        console.log('should have a pattern object in the arranger, thing is ', ref_toneObjects.current?.arranger)
    }, [])

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
            ref_toneObjects.current = {patterns: {}, tracks:[], arranger: [], flagObjects: []}
            initializeArranger()
            initializePattern()
            initializeFlags()
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