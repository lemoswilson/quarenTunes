import * as Tone from 'tone';
import { RecursivePartial } from 'tone/build/esm/core/util/Interface';
import { withSamples } from '../../containers/Track/defaults';

interface SampleMap {
    urls: {
        [note: string]: Tone.ToneAudioBuffer | AudioBuffer | string;
        [midi: number]: Tone.ToneAudioBuffer | AudioBuffer | string;
    },
    baseUrl: string;
}

interface DrumRackObj {
    [slot: number]: Tone.Sampler;
}

export default class DrumRack {
    obj: DrumRackObj;
    node: Tone.Gain;
    constructor(options?: any) {
        this.obj = {
            0: new Tone.Sampler(withSamples( options?.PAD_0 )),
            1: new Tone.Sampler(withSamples( options?.PAD_1 )),
            2: new Tone.Sampler(withSamples( options?.PAD_2 )),
            3: new Tone.Sampler(withSamples( options?.PAD_3 )),
        }

        this.node = new Tone.Gain().toDestination()
        Object.keys(this.obj).forEach((k) => {
            this.obj[Number(k)].connect(this.node)
        })
        return this
    }
    async set(data: RecursivePartial<Tone.SamplerOptions>, id?: number) {
        if (id || id === 0) {
            await this.obj[id].set(data)
        }
    }
    get(id?: number) {
        if (id || id === 0) {
            return this.obj[id].get()
        }
    }
    add(sample: any, id?: number){
        if (id || id === 0){
            this.obj[id].add("C3", sample);
        }
    }
    disposeSlot(id: number) {
        this.obj[id].disconnect()
        this.obj[id].dispose()
        delete this.obj[id]
    }
    dispose() {
        for (const key in this.obj) {
            this.obj[key].disconnect()
            this.obj[key].dispose()
            delete this.obj[key]
        }
        this.node.dispose();
    }
    createNew(id: number, data: RecursivePartial<Tone.SamplerOptions>): Tone.Sampler {
        if (this.obj[id]) return this.obj[id]
        else this.obj[id] = new Tone.Sampler().connect(this.node)
        this.set(data, id)
        return this.obj[id]
    }
    triggerAttackRelease(note: string, duration: string | number, time?: number, velocity?: number, pitch?: number) {
        const id = DrumRack.checkNote(note)
        if (id || id === 0) {
            const value = !Number.isNaN(Number(pitch)) ? Number(pitch) : 0;
            this.obj[id].triggerAttackRelease('C3', duration, time, velocity)
        }
    };
    triggerAttack(note: string, time?: number, velocity?: number, id?: number) {
        if (id || id === 0) {
            this.obj[id].triggerAttack(note, time, velocity)
        }
    }
    triggerRelease(note: string, time?: number, id?: number) {
        if (id || id === 0) {
            this.obj[id].triggerRelease(note, time)
        }
    }
    connect(destination: Tone.InputNode, outputNum: number = 0, inputNum: number = 0): Tone.Gain {
        this.node.connect(destination, outputNum, inputNum)
        return this.node
    }
    static checkNote(note: string) {
        return (
            note === 'C3'
                ? 0
                : note === 'D3'
                    ? 1
                    : note === 'E3'
                        ? 2
                        : note === 'F3'
                        ? 3
                        : undefined
        )
    }
    disconnect() {
        this.node.disconnect()
    }
    chain(...nodes: Tone.InputNode[]){
        this.node.disconnect()
        this.node.chain(...nodes)
    }
    sync(){
        Object.keys(this.obj).forEach(key => {
            this.obj[Number(key)].sync()
        })
        return this
    }
};