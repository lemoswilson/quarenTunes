import React from 'react';
import styles from './style.module.scss';
import ButtonBackground from '../Icons/ButtonBackground';
import R from '../../../assets/record.svg';

interface Record extends RecordSVGProps {
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    className?: string;
}

interface RecordSVGProps {
    active: boolean;
}

const RecordSVG: React.FC<RecordSVGProps> = ({active}) => {
    return (
        <svg className={styles.svg} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 19 20">
            {/* <defs><style>.cls-1{isolation:isolate;}.cls-2{opacity:0.5;mix-blend-mode:multiply;}.cls-3{fill:#d4d4d4;}</style>
            </defs> */}
            <title>rec</title>
            <g style={{isolation: 'isolate'}}>
                <g id="Layer_2" data-name="Layer 2">
                    <g id="Layer_1-2" data-name="Layer 1">
                        <g id="Transport">
                            <g id="Record">
                                {/* <image class="cls-2" width="19" height="20" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAVCAYAAABG1c6oAAAACXBIWXMAAAsSAAALEgHS3X78AAAByElEQVQ4T63UTU8TURTG8V/ptBUFRQKJGxMXhqWbfv+PMHs3RoxKjC9AUaSlTsfFObed1sLCcJKTebl3/vOc5557e23besioNl/Udd3L2+61/LWF8Xh8p4peV2HCdtDvZAEu0GQu0G4DL4EJqzDELh5jlNAGt7jBFDP8wWIT2mvbtgt7hGc4znyKQX78C+f4gct8nm9Cq06Zw4S9xGu8wlH+ZI4LnOEUH/L7nzm2Aua1L8o8TtgbnORzAU7wEfvC19vMpq7rpZ9VDvaFZ8dC2UmCD4XyBtfYE3ElSr8Snjb5fk3hSHh2JMCHwoJKlDQSqzvBCxwI9X3h8ZrConKQH46EsqoDHCZgN3No1VbLKJNbIXsuWmKW941YMBvjU+mfzoIUYJk8E558xzdRUlmsVnh4ga+ZEyv/1la5qPudoNOEVULFfs6diHZ5j88Jnwpfl9FVeCOA70SZU7GSz3POuQC+Fe1zIX643tjj8bit63qRg6XXSt99EmqJ3XGW41+EBWtNzd17eU+0zAGe5NzrhF7m/QzN1r1corMNBwJc2oeoYJbXf/Zwid7mAZvQAi5JmF9y69HFFmA3Ooct7j9YS9wL/J/Y8cDxF6zmzN0YTBc8AAAAAElFTkSuQmCC"/> */}
                                <image style={{opacity: 0.5, mixBlendMode: 'multiply'}} width="19" height="20" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAVCAYAAABG1c6oAAAACXBIWXMAAAsSAAALEgHS3X78AAAByElEQVQ4T63UTU8TURTG8V/ptBUFRQKJGxMXhqWbfv+PMHs3RoxKjC9AUaSlTsfFObed1sLCcJKTebl3/vOc5557e23besioNl/Udd3L2+61/LWF8Xh8p4peV2HCdtDvZAEu0GQu0G4DL4EJqzDELh5jlNAGt7jBFDP8wWIT2mvbtgt7hGc4znyKQX78C+f4gct8nm9Cq06Zw4S9xGu8wlH+ZI4LnOEUH/L7nzm2Aua1L8o8TtgbnORzAU7wEfvC19vMpq7rpZ9VDvaFZ8dC2UmCD4XyBtfYE3ElSr8Snjb5fk3hSHh2JMCHwoJKlDQSqzvBCxwI9X3h8ZrConKQH46EsqoDHCZgN3No1VbLKJNbIXsuWmKW941YMBvjU+mfzoIUYJk8E558xzdRUlmsVnh4ga+ZEyv/1la5qPudoNOEVULFfs6diHZ5j88Jnwpfl9FVeCOA70SZU7GSz3POuQC+Fe1zIX643tjj8bit63qRg6XXSt99EmqJ3XGW41+EBWtNzd17eU+0zAGe5NzrhF7m/QzN1r1corMNBwJc2oeoYJbXf/Zwid7mAZvQAi5JmF9y69HFFmA3Ooct7j9YS9wL/J/Y8cDxF6zmzN0YTBc8AAAAAElFTkSuQmCC"/>
                                {/* <circle class="cls-3" cx="7.48" cy="7.76" r="4.28"/> */}
                                <circle className={active ? styles.color : styles.inactive} cx="7.48" cy="7.76" r="4.28"/>
                            </g>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    )
}

const Record: React.FC<Record> = ({ onClick, className, active }) => {

    return (
        <ButtonBackground className={`${styles.hov} ${className}`} onClick={onClick} small={true} >
            {/* <img className={styles.img} src={R} alt='play' width='65%' height='65%' /> */}
            <RecordSVG active={active}/>
        </ButtonBackground>
    )
}

export default Record;