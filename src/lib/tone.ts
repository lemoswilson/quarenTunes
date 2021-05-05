import * as Tone from "tone";
// import Tone from "tone";
const context = new Tone.Context({ latencyHint: 'interactive' })

Tone.setContext(context)

export default Tone;
