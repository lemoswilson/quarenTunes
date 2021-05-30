import * as Tone from 'tone';
import { RecursivePartial } from 'tone/build/esm/core/util/Interface';
import { ObjectFlags } from 'typescript';
import { curveTypes, withSamples } from '../../containers/Track/defaults';
import { DrumRackSlotInitials } from '../../containers/Track/defaults';
import { onlyValues } from '../objectDecompose';
import { numberToNote } from '../../store/MidiInput/types';
import kick from '../../assets/drumkit/kick1.mp3'

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

interface DrumSlot extends Tone.SamplerOptions {
    pitch: number,
}

const init = {
    onload: () => {console.log('loaded samples')},
    onerror: (error: any) => (console.log('error, the error is ', error))
}

export default class DrumRack {
    obj: DrumRackObj;
    node: Tone.Gain;
    // trackCount: number;
    // constructor(initials: { [slot: string]: DrumSlot }) {
        // this.obj = {}
    constructor(options?: any) {
        this.obj = {
            // 0: new Tone.Sampler(options?.PAD_0),
            // 1: new Tone.Sampler(options?.PAD_1),
            // 2: new Tone.Sampler(options?.PAD_2),
            // 3: new Tone.Sampler(options?.PAD_3),
            0: new Tone.Sampler(withSamples( options?.PAD_0 )),
            1: new Tone.Sampler(withSamples( options?.PAD_1 )),
            2: new Tone.Sampler(withSamples( options?.PAD_2 )),
            3: new Tone.Sampler(withSamples( options?.PAD_3 )),
        }
        // if (options){
        //     if (options.PAD_0){
        //         console.log('setting options of pad_0', options.PAD_0);
        //         console.log('c3 is ', options.PAD_0.urls.C3);
        //         this.obj[0].set(options.PAD_0)
        //         console.log('options of pad 0 is', this.obj[0].get());
        //         // this.obj[0].set({urls: { C3: options.PAD_0.urls.C3 }});
        //         // this.obj[0].set({urls: { C3: kick}});
        //         this.set({urls: {C3: kick}}, 0);
        //         console.log('options of pad 0 after trying to directly change url is is', this.obj[0].get());
        //     }
        //     if (options.PAD_1){
        //         this.obj[1].set(options.PAD_1)
        //     }
        //     if (options.PAD_2){
        //         this.obj[2].set(options.PAD_2)
        //     }
        //     if (options.PAD_3){
        //         this.obj[3].set(options.PAD_3)

        //     }
        // }

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
    // setBaseUrl(base: string, id: number) {
    //     this.obj[id].set({ baseUrl: base });
    // }
    // setUrl(url: string, id: number) {
    //     this.obj[id].set({ urls: { C3: url } });
    // }
    // setVolume(volume: number, id: number) {
    //     this.obj[id].set({ volume: volume });
    // }
    // setCurve(curve: curveTypes, id: number) {
    //     this.obj[id].set({ curve: curve });
    // }
    // setAttack(attack: number, id: number) {
    //     this.obj[id].set({ attack: attack });
    // }
    // setRelease(release: number, id: number) {
    //     this.obj[id].set({ release: release });
    // }
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
        // const id =
        //     note === 'C3'
        //         ? 0
        //         : note === 'D3'
        //             ? 1
        //             : note === 'E3'
        //                 ? 2
        //                 : 3
        const id = DrumRack.checkNote(note)
        if (id || id === 0) {
            const value = !Number.isNaN(Number(pitch)) ? Number(pitch) : 0;
            // this.obj[id].triggerAttackRelease(numberToNote(60 + value), duration, time, velocity)
            this.obj[id].triggerAttackRelease('C3', '1m', time, velocity)
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