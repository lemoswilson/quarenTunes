import React, { useContext, useState, useEffect, useRef } from 'react';
import trackContext from '../../context/trackContext';
import toneContext from '../../context/toneContext';
import sequencerContext from '../../context/sequencerContext';
import './Sequencer.scss'
import Steps from './Steps/Steps.js'
import StepsEdit from './Steps/StepsEdit'

const Sequencer = (props) => {
    let TrackContext = useContext(trackContext);
    let Tone = useContext(toneContext);
    let SequencerContext = useContext(sequencerContext)
    const returnPartArray = (length) => {
        return [...Array(5).keys()].map(i => {
            return {time: `0:0:${i}`, velocity: 127}
        })
    }
    const newPart = new Tone.Part();



    const [patterns, setPatterns] = useState({
        0: {
            name: 'Pattern 1',
            patternLength: 16,
            tracks: {
                0: {
                    length: 16,
                    triggState: newPart,
                    }
                }
            },
        activePattern: 0,
        },
    );

    useEffect(() => {
        SequencerContext.updateSequencerState(patterns.activePattern, patterns[patterns.activePattern]);
    }, [patterns]);

    const addPattern = () => {
        setPatterns(state => {
            let copyState = state;
            let keyNumbers = Object.keys(state);
            let lastNumber;
            for (const key in keyNumbers) {
                if (state[key] || keyNumbers != 'activePattern'){
                    lastNumber = key;
                    continue
                } else {
                    copyState[key] = {
                        name: `Pattern ${key}`,
                        patternLength: 16,
                        tracks: {
                            0: {
                                length: 16,
                                triggState: new Tone.Part()
                                }
                            }
                        }
                    return copyState
                }
            }
            copyState[lastNumber + 1] = {
                name: `Pattern ${lastNumber + 1}`,
                patternLength: 16,
                tracks: {
                    0: {
                        length: 16,
                        triggState: new Tone.Part(),
                        }
                    }
                }
        })
    }

    // const setNote = (note, index) => {
    //     setPatterns(state => {
    //         let copyState = state;
    //         copyState[state.activePattern][TrackContext.selectedTrack]['triggState'].current.events[index].note = note;
    //     });
    // };



    // const changeLength = (newLength) => {
    //     setPatterns(state => {
    //         let stateCopy = state
    //         state[activePattern][TrackContext.selectedTrack][length] = newLength;
    //         return {
    //             ...stateCopy,
    //         }
    //     })
    // }

        return(
            <div className="sequencer">
                {/* <Steps pattern={patterns[activePattern][TrackContext.selectedTrack]} patternName={patterns[activePattern][name]} patternLength={patterns[activePattern][length]}></Steps>
                <StepsEdit changeLength={changeLength}></StepsEdit> */}
            </div>
        )
}

export default Sequencer;