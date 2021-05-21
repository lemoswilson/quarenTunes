import React from 'react';
import ButtonBackground from '../ButtonBackground';
import styles from './style.module.scss';
import mais from '../../../../assets/plus.svg';

interface Plus {
    className?: string;
    // width?: string | number;
    // height?: string | number;
    small?: boolean;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const PlusSVG: React.FC<{sty: React.CSSProperties}> = ({sty}) => {
    return (
        <svg className={styles.svg} style={sty} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 31 31">
            <title>plus</title>
            <g style={{isolation:'isolate'}}>
                <g id="Layer_2" data-name="Layer 2">
                    <g id="Layer_1-2" data-name="Layer 1">
                        <g id="PlusMinus">
                            <image style={{opacity: 0.5, mixBlendMode: 'multiply'}} width="31" height="31" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAADPElEQVRYR8WXSU8bQRCFP9vj2JgQCCQsh2xSoihSbvP/f8Ico1xygCw4EAyEYOMNTw6viu6BsT1IQSmp5Z5xu+vVq3rV7Vqe51S1LMtqNvVPgBwgTdPqG0VWqwrAnNeBho0acn4NzGzk9wVSCYA5bwCPgBUbCXI6tDECpsDsPiCWAogibwHrwHNgC4GYAufAKXAG9IEx92AiWbbArAF0kPN3wBtgAzn7CewDB4iRawSsklUB4PR3gG3gLfARgZkAPxA7I8TAEIH45wy0UNR7wEtgF0XcBi6A7whMY84epVYFQM1GgpytAk9QPeQo6nVUE81ofSUrACjRudOfRKMZDRAzLaQQX9PIsgxCGub2irpPzLlH2kI576CIfd5GjuvRaNi79pzftGzPWhTgjSVQkFoTUdkhUJrYfBfYtM0dBDZfte92UbRXqECnNu/7uyzLCkx4CjzyVeAZsGMbdhC1LaT914Qe4MW2En0HAjFEEh0AJ0iqPVS0BYk6gDpytAG8At4DL1BxeX47CNwugQVsvoeC2EZOxwhED/WIGqFbFiSaRPS3gadIYh+Q3jcJOfRUrFLOQBsx59QPUOQ5cAR0KZFozEATeGyb7aCothCA2wXXINRAgthpAmsEmvv2uY7AJZRItM7DWE4AMiGcmDm3OqQzMLOFlyhvRyiaEfNT4L+9U+moBv4Ah8Ax8JuQ/4IlaZrmWZb5sXoGfEUOLplfhFv2DHLaQ/k+IZwHf+zdFwRiQMkZETMwRkfrgW3wjXIZ5oSGBHLYBT6jiu8hZ1e23zHwiwCgYA4gJxTODEV/SLER7dnabcTCmj07A/vAJwRmgCgf2dyleeeykoB6tKVhjFAOCdcur/IaAtFHeZ7ZHnHtdNGJ6Aq4jkbpTelGBfalMxEj70dz73BTQoV707kqWT+yNXOvaYXTMFp0s9hONXfoztzRDBXbJcHhFJimaeoMLbQq9wFnZoKcnqLqdlCH9nzOHKktsioAQJvGxQa6lExQlS+U2iKrAiBWSJfQ29v2/oIlUltkVQBAkYEhojxBNbBUaots6f8CKNyW/Hrmh1NOBaktskoAYO59cemdb5lVBvBQ9lDHcWX77wD+AuWAYMT66SWuAAAAAElFTkSuQmCC"/>
                            <path className={styles.color} d="M23.56,12.41v.77a2.11,2.11,0,0,1-2.11,2.11H16.06v5.39A2.11,2.11,0,0,1,14,22.79h-.77a2.11,2.11,0,0,1-2.12-2.11V15.29H5.68a2.11,2.11,0,0,1-2.12-2.11v-.77a2.12,2.12,0,0,1,2.12-2.12h5.38V4.91a2.12,2.12,0,0,1,2.12-2.12H14a2.12,2.12,0,0,1,2.11,2.12v5.38h5.39A2.12,2.12,0,0,1,23.56,12.41Z"/>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    )
}



const Plus: React.FC<Plus> = ({ className, onClick, small }) => {

    const sty = small ? { marginLeft: '0.075rem', marginTop: '0.075rem' } : {};

    return (
        <ButtonBackground smallCircle={small} onClick={onClick} className={`${className} ${styles.hover}`}>
            {/* <img style={sty} className={styles.svg} src={mais} alt='plus' width={'100%'} height={'100%'} /> */}
           <PlusSVG sty={sty}/> 
        </ButtonBackground>
    )
}

export default Plus;