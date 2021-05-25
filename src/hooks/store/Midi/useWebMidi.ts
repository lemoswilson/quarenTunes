import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addDevice, removeDevice } from '../../../store/MidiInput'
import WebMidi from 'webmidi';

const useWebMidi = () => {
    const dispatch = useDispatch()

    useEffect(() => {
        console.log('should be enbling web midi')
        WebMidi.enable((err) => {
            if (err) {
                // should handle this nicely on the user interface
                console.log(err)
                return
            }

            WebMidi.addListener('connected', (event) => {
                dispatch(addDevice(event.port.name))
            })

            WebMidi.removeListener('disconnected', (event) => {
                dispatch(removeDevice(event.port.name))
            })

        })
    }, [])
}

export default useWebMidi;