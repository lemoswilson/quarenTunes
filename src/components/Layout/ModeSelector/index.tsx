import React, { MutableRefObject, useEffect, useRef } from 'react';
import ButtonBackground from '../Icons/ButtonBackground';
import styles from './style.module.scss';


const PatternMode: React.FC = ({}) => {

    return (
        <svg className={styles.patternMode} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 24">
            <defs>
                <linearGradient id="a" x1="7.82" y1="4.6" x2="17.45" y2="19.29" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#f0f0f0" stopOpacity="0.3"/>
                <stop offset="0.98" stopColor="#ededed" stopOpacity="0.3"/>
                </linearGradient>
            </defs>
            <title>doubleArrow</title>
            <g style={{isolation: "isolate"}}>
                <g>
                    <g>
                        <g>
                            <path d="M20.51,15.1a.8.8,0,0,1-.23.72l-.66.66-1.89,1.89a.87.87,0,0,1-.59.25.86.86,0,0,1-.6-.25.83.83,0,0,1,0-1.18l.69-.69H4.64a1.41,1.41,0,1,1,0-2.82H17.23L16.54,13a.83.83,0,0,1,0-1.18.86.86,0,0,1,.6-.25.87.87,0,0,1,.59.25l1.88,1.88.67.68A.81.81,0,0,1,20.51,15.1Z" style={{fill: 'url(#a)'}}/>
                            <path d="M20.51,15.1a.8.8,0,0,1-.23.72l-.66.66-1.89,1.89a.87.87,0,0,1-.59.25.86.86,0,0,1-.6-.25.83.83,0,0,1,0-1.18l.69-.69H4.64a1.41,1.41,0,1,1,0-2.82H17.23L16.54,13a.83.83,0,0,1,0-1.18.86.86,0,0,1,.6-.25.87.87,0,0,1,.59.25l1.88,1.88.67.68A.81.81,0,0,1,20.51,15.1Z" style={{fill: 'url(#a)'}}/>
                        </g>
                        <g>
                            <path d="M20.51,6.45a.8.8,0,0,1-.23.72l-.66.66L17.73,9.72a.87.87,0,0,1-.59.25.86.86,0,0,1-.6-.25.83.83,0,0,1,0-1.18l.69-.69H4.64A1.41,1.41,0,0,1,4.64,5H17.23l-.69-.69a.83.83,0,0,1,0-1.18.86.86,0,0,1,.6-.25.87.87,0,0,1,.59.25L19.61,5l.67.68A.81.81,0,0,1,20.51,6.45Z" style={{fill: 'url(#a)'}}/>
                            <path d="M20.51,6.45a.8.8,0,0,1-.23.72l-.66.66L17.73,9.72a.87.87,0,0,1-.59.25.86.86,0,0,1-.6-.25.83.83,0,0,1,0-1.18l.69-.69H4.64A1.41,1.41,0,0,1,4.64,5H17.23l-.69-.69a.83.83,0,0,1,0-1.18.86.86,0,0,1,.6-.25.87.87,0,0,1,.59.25L19.61,5l.67.68A.81.81,0,0,1,20.51,6.45Z" style={{fill: 'url(#a)'}}/>
                        </g>
                    </g>
                    <g>
                        <g>
                            <image width="26" height="15" transform="translate(0 9)" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAQCAYAAADnEwSWAAAACXBIWXMAAAsSAAALEgHS3X78AAABk0lEQVQ4T6XUTWtTQRSH8d+9eTER1BJFaksRRBAFN97vv3N7wYUUdGnpplSQqrGtbcbFmUmuadKm5MAwsznn+Z+3qVJKtrW2bavybppmbcBqG1iGVKjznTBDWgW9AeuqvMMK5AFGGOAK57jA1TJwDluh8i5oLSAT7OKRAJ3k8xN/u8AqpVRAPQzxMN89twN7AvASb/Ecv/EVh/iGM50M+9mxEoBn2M/32O0ZLsN2Mc2+LMp5LXqpn7OqRfA9fMAb7FiIWbYiYoSneIHHIniN7zjGKc7btk1N06RuZoPscIB3QunQ+sxK6Uei9IN8ngihY0utqPOdLCZpmu95+hvaNf6IPv3I7/9ilAGphbp9vM9nT6grgrrWLeNEDMdQTOEnfESLI0ybppmx6EkS9T7BZ1HrHYsyriplGZADvBbCjgTkMMe6sJwZ8z3riyUdC1DZuVXWhb3Kfsf4IqBnuLyxZ8Xuudjl95iIieyJXp3il1joWddh5d+44ZdVRA0FtMKlNV8Va2CbWqcSRVyy5hNmS9h97R9svJqOrwPFUAAAAABJRU5ErkJggg==" style={{opacity: 0.5, mixBlendMode: "multiply"}}/>
                            {/* <path d="M20.51,15.1a.8.8,0,0,1-.23.72l-.66.66-1.89,1.89a.87.87,0,0,1-.59.25.86.86,0,0,1-.6-.25.83.83,0,0,1,0-1.18l.69-.69H4.64a1.41,1.41,0,1,1,0-2.82H17.23L16.54,13a.83.83,0,0,1,0-1.18.86.86,0,0,1,.6-.25.87.87,0,0,1,.59.25l1.88,1.88.67.68A.81.81,0,0,1,20.51,15.1Z" style="fill: #909190"/> */}
                            <path d="M20.51,15.1a.8.8,0,0,1-.23.72l-.66.66-1.89,1.89a.87.87,0,0,1-.59.25.86.86,0,0,1-.6-.25.83.83,0,0,1,0-1.18l.69-.69H4.64a1.41,1.41,0,1,1,0-2.82H17.23L16.54,13a.83.83,0,0,1,0-1.18.86.86,0,0,1,.6-.25.87.87,0,0,1,.59.25l1.88,1.88.67.68A.81.81,0,0,1,20.51,15.1Z" className={styles.color}/>
                        </g>
                        <g>
                            <image width="26" height="16" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAARCAYAAAAsT9czAAAACXBIWXMAAAsSAAALEgHS3X78AAABVklEQVQ4T73VTU8UQRSF4WeGQVDUGL6CblywMtG4qP//E2pnCCFhY0JCGNQENfIxTrm41dAz9BAGcE7S6e50Vb3n3Lrd3SuleKxyzr3mOqU0c8HeY2AV0kO/ngvGKF3QTljb6R1qICtYxTJGOMcFRtPACViH07ugfQFZxw5eCdBJPX7iqg28hlXQQDh9jmduoF1aEoD3+IBt/MYB9vAVZ1oJB0yAXtZJb/FGAGclnIbt4A826/imnH/FXgasPlzBFj7iE97hhUg3rcbAKjaEude4rON/4AinOM85l5RSGdRUfZFiA7v4LByv6YYRsCUBXKvzr4ThbQFf1qrKrIX+iwYppZJzHosSfMOhKN/Qw8o4FN14JpJed2OzZ0Vs5hBfBPShDbKHfRzX+/FEN9Z0I/wSbr67f+sfiYaYbv0TEeD2e8YCX+q2FvK5mldP8iGeVwv5xcyrf1WOoYJf/NAnAAAAAElFTkSuQmCC" style={{opacity: 0.5, mixBlendMode: "multiply"}}/>
                            {/* <path d="M20.51,6.45a.8.8,0,0,1-.23.72l-.66.66L17.73,9.72a.87.87,0,0,1-.59.25.86.86,0,0,1-.6-.25.83.83,0,0,1,0-1.18l.69-.69H4.64A1.41,1.41,0,0,1,4.64,5H17.23l-.69-.69a.83.83,0,0,1,0-1.18.86.86,0,0,1,.6-.25.87.87,0,0,1,.59.25L19.61,5l.67.68A.81.81,0,0,1,20.51,6.45Z" style="fill: #909190"/> */}
                            <path d="M20.51,6.45a.8.8,0,0,1-.23.72l-.66.66L17.73,9.72a.87.87,0,0,1-.59.25.86.86,0,0,1-.6-.25.83.83,0,0,1,0-1.18l.69-.69H4.64A1.41,1.41,0,0,1,4.64,5H17.23l-.69-.69a.83.83,0,0,1,0-1.18.86.86,0,0,1,.6-.25.87.87,0,0,1,.59.25L19.61,5l.67.68A.81.81,0,0,1,20.51,6.45Z" className={styles.color}/>
                        </g>
                    </g>
                </g>
            </g>
        </svg>

    )
}

const ArrangerMode: React.FC = () => {

    return (
        <svg className={styles.arrangerMode} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 25 15">
            <defs>
                <linearGradient id="a" x1="9.1" y1="2.73" x2="14.97" y2="11.7" gradientUnits="userSpaceOnUse">
                <stop offset="0" stop-color="#f0f0f0" stop-opacity="0.3"/>
                <stop offset="0.98" stop-color="#ededed" stop-opacity="0.3"/>
                </linearGradient>
            </defs>
            <title>singleArrow</title>
            {/* <g style="isolation: isolate"> */}
            <g style={{isolation: 'isolate'}}>
                <g>
                <g>
                    {/* <path d="M20.15,6.41a.8.8,0,0,1-.23.72l-.66.66L17.37,9.68a.87.87,0,0,1-.59.25.86.86,0,0,1-.6-.25.83.83,0,0,1,0-1.18l.69-.69H4.28A1.41,1.41,0,0,1,4.28,5H16.87l-.69-.69a.83.83,0,0,1,0-1.18.86.86,0,0,1,.6-.25.87.87,0,0,1,.59.25L19.25,5l.67.68A.81.81,0,0,1,20.15,6.41Z" style="fill: url(#a)"/> */}
                    <path d="M20.15,6.41a.8.8,0,0,1-.23.72l-.66.66L17.37,9.68a.87.87,0,0,1-.59.25.86.86,0,0,1-.6-.25.83.83,0,0,1,0-1.18l.69-.69H4.28A1.41,1.41,0,0,1,4.28,5H16.87l-.69-.69a.83.83,0,0,1,0-1.18.86.86,0,0,1,.6-.25.87.87,0,0,1,.59.25L19.25,5l.67.68A.81.81,0,0,1,20.15,6.41Z" style={{fill: 'url(#a)'}}/>
                    <path d="M20.15,6.41a.8.8,0,0,1-.23.72l-.66.66L17.37,9.68a.87.87,0,0,1-.59.25.86.86,0,0,1-.6-.25.83.83,0,0,1,0-1.18l.69-.69H4.28A1.41,1.41,0,0,1,4.28,5H16.87l-.69-.69a.83.83,0,0,1,0-1.18.86.86,0,0,1,.6-.25.87.87,0,0,1,.59.25L19.25,5l.67.68A.81.81,0,0,1,20.15,6.41Z" style={{fill: 'url(#a)'}}/>
                </g>
                <g>
                    {/* <image width="25" height="15" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAQCAYAAAAI0W+oAAAACXBIWXMAAAsSAAALEgHS3X78AAABLUlEQVQ4T73UyUoDQRSF4a+TxlkQRUFBBHWpuKj3f4MEXLjQhaBEF46IiDimXNxujUNEjPFAL7qpOv+5t25XkXM2qNrtdgEppb5mxSCgClA/kJG/An4C1el+oAINjGC0en/APZ4+wl5BPeka3qfsp4YAzGIOTVzhHDd4TCl168VFzrmGlNXGcZGyBvZTE9NYxqrYe4w9dHCNh7qyotVq1ZApLGARMwL2XWW9oHURsIM2tnEoYE8ppVxWRqOYxwY2sYQJUdVXqgOMidYtiGDz1fc73IrzekYuvR3oHNawhRVM6g8iDJsCNl6tLUUVRzjAqYB2vzP6U5XoirG8wL5o2Znfte6k8jjApfDtEqAsenmGHQEcdBh2hd+98P/H8f7XH7ZXQ7+CfqOBLtVh6QX4yokcCgul3AAAAABJRU5ErkJggg==" style="opacity: 0.5;mix-blend-mode: multiply"/> */}
                    <image width="25" height="15" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAQCAYAAAAI0W+oAAAACXBIWXMAAAsSAAALEgHS3X78AAABLUlEQVQ4T73UyUoDQRSF4a+TxlkQRUFBBHWpuKj3f4MEXLjQhaBEF46IiDimXNxujUNEjPFAL7qpOv+5t25XkXM2qNrtdgEppb5mxSCgClA/kJG/An4C1el+oAINjGC0en/APZ4+wl5BPeka3qfsp4YAzGIOTVzhHDd4TCl168VFzrmGlNXGcZGyBvZTE9NYxqrYe4w9dHCNh7qyotVq1ZApLGARMwL2XWW9oHURsIM2tnEoYE8ppVxWRqOYxwY2sYQJUdVXqgOMidYtiGDz1fc73IrzekYuvR3oHNawhRVM6g8iDJsCNl6tLUUVRzjAqYB2vzP6U5XoirG8wL5o2Znfte6k8jjApfDtEqAsenmGHQEcdBh2hd+98P/H8f7XH7ZXQ7+CfqOBLtVh6QX4yokcCgul3AAAAABJRU5ErkJggg==" style={{opacity: 0.5, mixBlendMode: "multiply"}}/>
                    {/* <path d="M20.15,6.41a.8.8,0,0,1-.23.72l-.66.66L17.37,9.68a.87.87,0,0,1-.59.25.86.86,0,0,1-.6-.25.83.83,0,0,1,0-1.18l.69-.69H4.28A1.41,1.41,0,0,1,4.28,5H16.87l-.69-.69a.83.83,0,0,1,0-1.18.86.86,0,0,1,.6-.25.87.87,0,0,1,.59.25L19.25,5l.67.68A.81.81,0,0,1,20.15,6.41Z" style="fill: #909190"/> */}
                    <path d="M20.15,6.41a.8.8,0,0,1-.23.72l-.66.66L17.37,9.68a.87.87,0,0,1-.59.25.86.86,0,0,1-.6-.25.83.83,0,0,1,0-1.18l.69-.69H4.28A1.41,1.41,0,0,1,4.28,5H16.87l-.69-.69a.83.83,0,0,1,0-1.18.86.86,0,0,1,.6-.25.87.87,0,0,1,.59.25L19.25,5l.67.68A.81.81,0,0,1,20.15,6.41Z" className={styles.color}/>
                </g>
                </g>
            </g>
        </svg>
    )
}

interface ModeSelectorProps {
    onClick: () => void;
    mode: 'arranger' | 'pattern'
}

const ModeSelector: React.FC<ModeSelectorProps> = ({onClick, mode}) => {

    return (
        <ButtonBackground small={true} onClick={onClick}>
            { mode === 'arranger' ? <ArrangerMode/> : <PatternMode/> }
        </ButtonBackground>
    )
};

export default ModeSelector;