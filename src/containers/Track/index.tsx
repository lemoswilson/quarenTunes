import React, { FunctionComponent } from 'react';


import { Instrument } from './Instruments'
import Effect from './Effects/Effect'
import Tabs from '../../components/Layout/Instruments/Tabs';

import styles from './style.module.scss';

import useTrackDispatchers from '../../hooks/store/Track/useTrackDispatchers';


const Track: FunctionComponent = () => {

    const {
        trackDispatchers,
        Tracks, 
        selectedTrkIdx,
        selectedTrk_Id,
    } = useTrackDispatchers()

    return (
        // should abstract all this logic here in a component
        // that just returns html
        <div className={styles.trackWrapper}>
            <div className={styles.instrumentColumn}>
                <Tabs 
                Tracks={Tracks} 
                removeInstrument={trackDispatchers._removeInstrument}
                changeInstrument={trackDispatchers._changeInstrument}
                selectInstrument={trackDispatchers._selectInstrument}
                addInstrument={trackDispatchers._addInstrument}
                setMIDIInput={{
                    channel: trackDispatchers._selectMIDIChannel,
                    device: trackDispatchers._selectMIDIDevice,
                }}
                />
                <div className={styles.box}>
                    {Tracks.map((trackInfo, idx, arr) => {
                        return <Instrument
                            key={`instrument ${trackInfo.id}`}
                            id={trackInfo.id}
                            index={idx}
                            midi={trackInfo.midi}
                            options={trackInfo.options}
                            selected={selectedTrkIdx === idx}
                            voice={trackInfo.instrument}
                        ></Instrument>
                    })}
                </div>
            </div>
            <div className={styles.effectsColumn}>
                <div className={styles.wrapper}>
                    {Tracks[selectedTrkIdx].fx.map((fx, idx, arr) => {
                        return (
                            <Effect
                                addEffect={trackDispatchers._addEffect}
                                changeEffect={trackDispatchers._changeEffect}
                                deleteEffect={trackDispatchers._deleteEffect}
                                key={`track:${selectedTrk_Id};effect:${fx.id}`}
                                fxId={fx.id}
                                trackIndex={selectedTrkIdx}
                                fxIndex={idx}
                                midi={Tracks[selectedTrkIdx].midi}
                                options={fx.options}
                                trackId={Tracks[selectedTrkIdx].id}
                                type={fx.fx}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
};

export default Track;
