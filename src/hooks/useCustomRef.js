import { useRef, useContext } from 'react';
// import toneContext from '../context/toneContext';

const useCustomRef = (value) => {
    // let Tone = useContext(toneContext);
    const ref = useRef(value)
    return ref.current;
};

export default useCustomRef;