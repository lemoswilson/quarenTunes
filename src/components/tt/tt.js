import React, { Component, useContext } from 'react';
import ToneContext from '../../context/toneContext';



const Ttest = (props) => {


    let Tone = useContext(ToneContext);

    function sorta(i) {
        return `0:0:${i}`
    }

    let blonkers = [...Array(16).keys()].map((i) => {
        return [sorta(i), "C3"]
    })

    let clonkers = [...Array(16).keys()].map((i) => {
        return [sorta(i), "C4"]
    })

    let chookBeat = new Tone.Part(mong, clonkers);
    let filter = new Tone.Filter().toMaster()
    let metallicSynth = new Tone.MetalSynth().chain(filter)


    let bassSynth = new Tone.MembraneSynth().toMaster();
    let loopBeat = new Tone.Part(song, blonkers);
    // let counter = 0;

    Tone.Transport.bpm.value = 140;

    function actionHandler() {
        loopBeat.loop = true;
        loopBeat.loopEnd = "4n"
        chookBeat.loop = true;
        chookBeat.loopEnd = "1m";
        loopBeat.start();
        chookBeat.start("1:0:0")
        // console.log(Tone.Timeline.length)
        Tone.Transport.start();
    }

    // function stop() {
    //     Tone.Transport.stop();
    //     counter = 0;
    // }


    function song(time, note) {
        bassSynth.triggerAttackRelease(note, '8n', time);
        console.log(time, note);
        console.log(Tone.Transport.position)
        // counter = counter + 1;
        // console.log(counter);
    }

    function mong(time, note) {
        metallicSynth.triggerAttackRelease('16n', time)
        console.log(time, note);
        console.log(Tone.Transport.position)
    }
    
    return(
       <React.Fragment>
           <button onClick={actionHandler}>start</button> 
       </React.Fragment>
    )
}


export default Ttest;

