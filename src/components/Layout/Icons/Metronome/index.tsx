import React from 'react';
import ButtonBackground from '../ButtonBackground';
import styles from './style.module.scss';

interface MetronomeSVGProps {
    active: boolean;
}

const MetronomeSVG: React.FC<MetronomeSVGProps> = ({ active }) => {
    return (
        <svg className={styles.svg} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 20 29">
            <title>metronome</title>
            <g style={{isolation: "isolate"}}>
                <g>
                <image width="20" height="29" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAeCAYAAADD0FVVAAAACXBIWXMAAAsSAAALEgHS3X78AAACSElEQVRIS8XW2WsUQRDA4W+y8QzeEW9F8QDBBxkf/f9BYfEAEQ1EI5iAia4JmsSYnfGhanYnu5tFSNCCore3p391TFX3FHVdmybdbrdoz8uynL4BxX7QhBWYyRFqVKinwSdCE9jBUZzAsVzawRZ+ob8feAyawBkcxzyu4kIu9/AZawJeMZ6SAbQVbgezOIt7eIw7wtASXuEdvgnPKyMpKeq6Hg33JOZwEY/wFA/T0Ac8wwvh8Q/h8VZjoCzLelZIkcB5XMclXMZ93MWNXD8uvDqBT1jFSuq6yLXZVg5PJvAJHuBKwq/hjPC0Sc18ghbxGpvC6wJjnp4Xnj1O6FzqUWG4gyNp5ILwejHXBjJrr3REiKdxToTZMazVIv+bEXk8gr7IZ1/U8cBCjd8ihF6Ov5uHJkglQJupTRWAmSyDWiR5FR9TV/Ad24Ze9HPew3JqL/cOoE34VS6s4T1O5fw2booXc6z1zIJ4QW+E8S1ZTgNoWZZ1t9vdxYZI/G5u/iZyOpfjpqjPl3iOt/iSxgapar+oSoS2muOmeCl3cCt/7+CraIIFEf5P7LZbdVAK+WdfhLIuvFw3OacbqVujwD1QBuAqN+/mWBmG1qy3daxC9kBbUrd02vpE2Q96IPnv0CbkyiGE3wCaHt82bMuJ4GnQdiU0d1NP1OmGKWfD6CnVSLsmv4uuWRfd9sGwQSbeqtOgO4ZnQV+06VLO14wcIm3Z74pu36bXxOFdiC5blrdpWZb9sc3+ztOfJt/7E73kX36htOVQv6UOIn8At/EgjVevVu8AAAAASUVORK5CYII=" style={{opacity: 0.5, mixBlendMode: "multiply"}}/>
                {/* <path d="M15,5.74V6l-1.4,5.36H11.05V21a2,2,0,0,1-4,0V11.33H4.54L3.14,6V5.74H7.05V4.89a2,2,0,0,1,4,0v.85Z" style="fill: #d4d4d4"/> */}
                <path d="M15,5.74V6l-1.4,5.36H11.05V21a2,2,0,0,1-4,0V11.33H4.54L3.14,6V5.74H7.05V4.89a2,2,0,0,1,4,0v.85Z" className={ active ? styles.active : styles.inactive }/>
                </g>
            </g>
        </svg>
    )
}

interface MetronomeProps extends MetronomeSVGProps {
    toggleMetronome: () => void;
    className?: string;
}

const Metronome: React.FC<MetronomeProps> = ({toggleMetronome, className, active}) => {
    return (
        <ButtonBackground 
            small={true} 
            className={className} 
            onClick={toggleMetronome}
        >
            <MetronomeSVG active={active}/>
        </ButtonBackground>
    )
}

export default Metronome;