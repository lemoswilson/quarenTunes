import React from 'react';
import styles from './style.module.scss';
import ButtonBackground from '../ButtonBackground';

const XSvg: React.FC<{className?: string, onClick?: () => void}> = ({className, onClick}) => {
    return (
        <svg onClick={onClick} className={ `${ styles.svg } ${className}`} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 26 25">
            <title>X</title>
            <g style={{  isolation: 'isolate' } }>
                <g>
                    <image width="26" height="25" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAaCAYAAABGiCfwAAAACXBIWXMAAAsSAAALEgHS3X78AAADPUlEQVRIS7XWe08cZRQG8N8CFdjU3tKAQqHWRGMqKmZi65fgg6uZRAI2jTFpFSuCKBcrd3b845zZmVm2MSb6JpvZeec873Ouz0yvqir1Ksuyhx4m8lphgKooisZwZI3gvAnTq8kSMIVpzOT/S5ziDJfjCEdwb+X2+ThMr6qqNuAm5vAO+jjGbv5e46IoikGLaAI3Encf9/LR7/gtMUPCqXzYE57N4RN8nMBDfI9n2MJRWZYXIr29JLqFJXyEhyKFP2ATF7hKe5Nra2s9TArv3scTPMVjvCsiHIh0norUVi2ih1jFl/g8MZWIbh9n29vb1cLCQieyqTz4HuaxKLzqC2d6absl0tsXEa0K5z4VmTnEDm4Lh2rckKzKg0/S+M+8v4nlFqBO3T7uYkVkYhUPRIMct+w7a6ooiqosy4Eg2hE1mhOeL2NWREBE2MeeaIjPRI2X0u4vkb5dHImaDbuxHdlZGj0TzVKnrj5oOffuaCJ7T6R7Rjj7c+Kf49fcG3S6MaO7FK26pRnqetURLotanCbBbZG6k8St4xtBuCsCuBZZTXghwv8xt+tOnRREfUE60Dh0jFfYwNeCcMvIjNHIC8iBrQm3xKys44VonEpEMpvXKvdfpN1m4o6EAHQUp0OWqxKzdCxqs4cDkbqBrnbW83eQdvuJq2exs8aRtWfurui6O6JGE1rinPcz+fx+2vcTf639O2QtraslaEW09yPRDD0hsid57eX+o7RbSdwt3EjNHa5hg+SDUQl6IuZoUTOwh653Y602VyLqgWiyo7Isu0I8ovpLwsunSbikmaNXeGn8nC1plOgs7c+0hHic6j/GF4KwHuh6jjZE19UKcpCH1XYPRNR7wrE9nJZlWRVFUU1lVBNpPI8PxeticYToWzFHm5rIjpNMEk0LJ+Y1Kb4mxPXwzqbR23n/Wni4jq8EYa36+7raNxAvXaL2U0aUqK2N9Wz9IQSZUP/nQoLWZdHT9lwQ1PgrfCAOPzRSL7qqfyrE87t8NvZNrYmmLW2DPHxHNMtPol7nHbK8tlV/Q3w//NM3yKiW1rWdzr1fEj9U/f/662pG1PpSM/hX18hawLb2DaXpX3w3vhHXIfu/19/NWX54/Hc3ZwAAAABJRU5ErkJggg==" style={{opacity: 0.5, mixBlendMode: 'multiply'}}/>
                    <path className={styles.color} d="M20.93,17a1,1,0,0,1,0,1.41L19.8,19.57a1,1,0,0,1-1.41,0L12.32,13.5,6.25,19.57a1,1,0,0,1-1.42,0L3.71,18.44a1,1,0,0,1,0-1.41L9.78,11,3.71,4.89a1,1,0,0,1,0-1.42L4.83,2.35a1,1,0,0,1,1.42,0l6.07,6.07,6.07-6.07a1,1,0,0,1,1.41,0l1.13,1.12a1,1,0,0,1,0,1.42L14.86,11Z"/>
                </g>
            </g>
        </svg>

    )
}

const X: React.FC<{small?: boolean}>= ({small}) => {
    return (
        <ButtonBackground small={small}>
            <XSvg/>
        </ButtonBackground>
    )
}

export default XSvg;