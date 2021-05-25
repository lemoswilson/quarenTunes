import { useCallback, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import WebMidi, { InputEventNoteon, InputEventNoteoff, Input } from 'webmidi';
import { midi } from '../../store/Track';
import { noteOn, noteOff } from '../../store/MidiInput';

export const useMidiNote = (
    midi: midi, 
    noteInCallback: (
        noteNumber: number, 
        noteName: string, 
        time: number, 
        velocity?: number | undefined
    ) => void,
    noteOffCallback: (noteNumber: number, noteName: string) => void,
) => {

    const dispatch = useDispatch();
    const ref_midiInput = useRef<false | Input>(false);

    const midiInCallback = useCallback((e: InputEventNoteon) => {
        const noteNumber = e.note.number;
        const noteName = e.note.name + e.note.octave;
        // const velocity = e.velocity * 127;
        const velocity = e.velocity * 127;
        const time = Date.now() / 1000;

        if (midi.device && midi.channel) {
            dispatch(noteOn([noteNumber], midi.device, midi.channel));
        }
        noteInCallback(noteNumber, noteName, time, velocity)

    }, [midi.device, midi.channel])

    const midiOffCallback = useCallback((e: InputEventNoteoff) => {
        const noteNumber = e.note.number;
        const noteName = e.note.name + e.note.octave;

        if (midi.device && midi.channel) {
            dispatch(noteOff([noteNumber], midi.device, midi.channel))
        }
        noteOffCallback(noteNumber, noteName)

    }, [midi.device, midi.channel]) 
    
    useEffect(() => {
        const v = midi.channel !== 'all'  && !Number.isNaN(Number(midi.channel)) ? Number(midi.channel) : midi.channel

        if (v && midi.device && midi.device !== 'onboardKey') {

            ref_midiInput.current = WebMidi.getInputByName(midi.device);

            if (
                ref_midiInput.current

            ) {
                ref_midiInput.current.addListener('noteon', midi.channel, midiInCallback);
                ref_midiInput.current.addListener('noteoff', midi.channel, midiOffCallback);
            }

            return () => {
                if (ref_midiInput.current
                    && midi.channel
                    && ref_midiInput.current.hasListener('noteon', midi.channel, midiInCallback)
                ) {
                    ref_midiInput.current.removeListener('noteon', midi.channel, midiInCallback);
                    ref_midiInput.current.removeListener('noteoff', midi.channel, midiOffCallback);
                }
            }

        } 

    }, [midi.device, midi.channel])

}