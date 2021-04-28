import Tone from './tone'
// import * as Tone from 'tone';
import { toneEffects } from '../store/Track';

class Chain {
    public in: Tone.Gain;
    public out: Tone.Gain;
    public dispose: () => void;
    constructor(effects?: toneEffects[]) {
        this.in = new Tone.Gain()
        this.out = new Tone.Gain().toDestination()
        this.dispose = () => {
            this.in.dispose();
            this.out.dispose();
        }
        if (effects) {
            effects.forEach((v, idx, arr) => {
                if (idx === 0) {
                    this.in.connect(v)
                    if (!arr[idx + 1]) v.connect(this.out)
                } else if (idx !== 0 && arr[idx + 1])
                    arr[idx - 1].connect(v);
                else if (idx !== 0 && !arr[idx + 1])
                    arr[idx - 1].connect(v) && v.connect(this.out);
            })
        } else {
            this.in.connect(this.out)
        }
    }
}

export default Chain;