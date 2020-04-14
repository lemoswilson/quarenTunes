import * as Tone from 'tone';

// Transport reducer
let transportState = {
    isPlaying: new Boolean,
    Position: new Tone.Time(),
    bpm: new Number(),
    loopStart: new Tone.Time(),
    loopEnd: new Tone.Time(),
    mode: new String() // three modes, pattern, song, 
}

// Sequencer Reducer state
let sequencerState = {
    patterns: {
        'name': {
            triggState: new Object(), // object containing the triggerStates of the sequence,
            loop: new Boolean(),// vai variar de acordo com transportState mode
            loopEnd: new String(), // size of the part in 16n.BarsBeatsSixteenths
            start: new Tone.Time(), // if loop mode equal to chain or to song -- this will be dinamycally set
        }, 
        'name': new Object(), // ...
    }
}

// Main window reducer
let mainWinow = {
    track1: {
        instrument: instrument,
        fx1: fx1,
        fx1: fx2,
        fx3: fx3,
        fx4: fx4,
    },
    track2: {
        instrument: instrument,
        fx1: fx1,
        fx1: fx2,
        fx3: fx3,
        fx4: fx4,
    },
    track3: {
        instrument: instrument,
        fx1: fx1,
        fx1: fx2,
        fx3: fx3,
        fx4: fx4,
    },
    track4: {
        instrument: instrument,
        fx1: fx1,
        fx1: fx2,
        fx3: fx3,
        fx4: fx4,
    },
}

// Instruments reducer state
let instruments = {
    instrument1: { parameter:value },
    instrument2: { parameter:value },
    instrument3: { parameter:value },
    instrument4: { parameter:value }
}

// Effects reducer state
let effects = {
    instrument1: {
        fx1: {
            parameter:value
        },
        fx2: {
            parameter:value
        },
        fx3: {
            parameter:value
        },
        fx4: {
            parameter:value
        },
    },
    instrument2: {
        fx1: {
            parameter:value
        },
        fx2: {
            parameter:value
        },
        fx3: {
            parameter:value
        },
        fx4: {
            parameter:value
        },
    },
    instrument3: {
        fx1: {
            parameter:value
        },
        fx2: {
            parameter:value
        },
        fx3: {
            parameter:value
        },
        fx4: {
            parameter:value
        },
    },
    instrument4: {
        fx1: {
            parameter:value
        },
        fx2: {
            parameter:value
        },
        fx3: {
            parameter:value
        },
        fx4: {
            parameter:value
        },
    },
}

// Mixer Reducer

let mixerState = {
    track1: {
        volume: value,
        panning: value,
        solo: false,
        mute: false
    },
    track2: {
        volume: value,
        panning: value,
        solo: false,
        mute: false
    },
    track3: {
        volume: value,
        panning: value,
        solo: false,
        mute: false
    },
    track4: {
        volume: value,
        panning: value,
        solo: false,
        mute: false
    },
}



// ArrangerState
let arrangerState = {
    active: 'name', 
    name: [[sequencerState.patterns.name, 0, [0,2,3], Tone.Time.start, Tone.Time.end], [sequencerState.patterns.name, 0, [0,2,3], Tone.Time.start, Tone.Time.end]],
    chain: [sequencerState.patterns.name, sequencerState.patterns.name]
}

// trig handler function will set the values in the partState


function setLocks(triggState) {
    let eventState = new Object()
    Object.keys(triggState).map(key => {
        if (key != "isLocked") {
           eventState[key] = triggState[key];
        } else {
            triggState[key].map(parameter => {
                eventState[parameter] = triggState[key][parameter];
            })
        }
    })
    return eventState;
}

function part(time, value) {
    if (value.on){
        Object.keys(value).map(key => {
            switch(key){
                case ('parameterX'):
                    // set instrument parameter to value[key]
            }
        })
    }
    // play note at value with probability
}

let triggState = {
    "on": new Boolean,
    "time": new Tone.Time(),
    "note": new String(),
    "isLocked": [{parameter: value}, {parameter: value}],
    "probability": "prob"
}




// Each instrument will have its own state type
// Each instrument will have its partState