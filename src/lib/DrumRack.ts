import * as Tone from 'tone';
import { RecursivePartial } from 'tone/build/esm/core/util/Interface';
import { ObjectFlags } from 'typescript';
import { curveTypes } from '../containers/Track/defaults';
import { DrumRackSlotInitials } from '../containers/Track/defaults';
import { onlyValues } from './objectDecompose';
import { numberToNote } from '../store/MidiInput/types';

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

export default class DrumRack {
    obj: DrumRackObj;
    node: Tone.Gain;
    // trackCount: number;
    constructor(initials: { [slot: string]: DrumSlot }) {
        this.obj = {}
        this.node = new Tone.Gain().toDestination()
        Object.keys(initials).forEach((v, k, arr) => {
            // this.obj[Number(k)] = new Tone.Sampler(onlyValues(initials[Number(k)]))
            this.obj[Number(k)] = new Tone.Sampler(initials[v]).connect(this.node)
        })
    }
    set(data: Tone.SamplerOptions, id?: number) {
        if (id) {
            this.obj[id].set(data)
        }
    }
    get(id?: number) {
        if (id) {
            return this.obj[id].get()
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
    createNew(id: number, map: SampleMap): Tone.Sampler {
        if (this.obj[id]) return this.obj[id]
        else this.obj[id] = new Tone.Sampler({ ...map }).connect(this.node)
        return this.obj[id]
    }
    triggerAttackRelease(note: string, duration: string | number, time?: number, velocity?: number, pitch?: number) {
        const id =
            note === 'C3'
                ? 0
                : note === 'D3'
                    ? 1
                    : note === 'E3'
                        ? 2
                        : 3
        this.obj[id].triggerAttackRelease(numberToNote(60 + Number(pitch)), duration)
    };
    triggerAttack(note: string, time?: number, velocity?: number, id?: number) {
        if (id) {
            this.obj[id].triggerAttack(note, time, velocity)
        }
    }
    triggerRelease(note: string, time?: number, id?: number) {
        if (id) {
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
                        : 3
        )
    }
    disconnect() {
        this.node.disconnect()
    }
    chain(...nodes: Tone.InputNode[]){
        this.node.disconnect()
        this.node.chain(...nodes)
    }
};