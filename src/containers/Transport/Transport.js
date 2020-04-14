import React, { Component, useContext, useEffect } from 'react';
import ToneContext from '../../context/toneContext';
import './Transport.scss';
import { useState } from 'react';
import { start } from 'tone';

// class Transport extends Component {
//     constructor(props){
//         super(props);
//         this.state = {
//             isPlaying: false,
//             indicatorPosition: '0:0:0',
//             bpm: 120,
//             loopStart: 0,
//             loopEnd: '4m',
//             mode: 'pattern' // three modes, pattern, song, 
//         }
//     }

//     static contextType = ToneContext;

//     componentDidMount(){
//         if(this.state.isPlaying){
//             this.context.Tone.Transport.start();
//         } else {
//             this.context.Tone.Transport.stop();
//         }
//     }


//     start = () => {
//         if (!this.state.isPlaying){
//             this.setState({
//                 isPlaying: true,
//             })
//             this.Tone.Transport.start();
//         }
//         // se ja tiver tocando voltar para o indicador position
//     }

//     stop = () => {
//         if (this.state.isPlaying) {
//         this.Tone.Transport.stop();
//         }
//     }

//     render() {
//         return(
//             <div className="transport">
//                 <div className="start" onClick={this.start}>Start</div>
//                 <div className="stop" onClick={this.stop}>Stop</div>
//             </div>
//         )
//     }
// }

const Transport = (props) => {
    const [transportState, setTransportState] = useState({
        isPlaying: false,
        indicatorPosition: '0:0:0',
        bpm: 120,
        loopStart: 0,
        loopEnd: '4m',
        mode: 'pattern' // three modes, pattern, song, 
    })
    let Tone = useContext(ToneContext);


    useEffect(() => {
        if(transportState.isPlaying){
            Tone.Transport.start();
        } else {
            Tone.Transport.stop();
        }
    }, []) ;

    const start = () => {
        if (!transportState.isPlaying){
            setTransportState({
                isPlaying: true,
            })
            Tone.Transport.start();
        }
        // se ja tiver tocando voltar para o indicador position
    }

    const stopTransport = () => {
        if (transportState.isPlaying) {
        Tone.Transport.stop();
        }
    }

        return(
            <div className="transport">
                <div className="start" onClick={start}>Start</div>
                <div className="stop" onClick={stopTransport}>Stop</div>
            </div>
        )
}

export default Transport;