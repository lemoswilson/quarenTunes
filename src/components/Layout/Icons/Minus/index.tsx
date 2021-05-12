import React from 'react';
import ButtonBackground from '../ButtonBackground';
import styles from './style.module.scss';
import minus from '../../../../assets/minus.svg';

interface Minus {
    // width?: string | number;
    // height?: string | number;
    className?: string;
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    small?: boolean;
}

const MinusSVG: React.FC = () => {
    return (
        <svg className={styles.svg} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 31 16">
            {/* <defs>
                <style>.cls-1{isolation:isolate;}.cls-2{opacity:0.5;mix-blend-mode:multiply;}.cls-3{fill:#d4d4d4;}</style>
            </defs> */}
            <title>Minus</title>
            {/* <g class="cls-1"> */}
            <g style={{isolation:'isolate'}}>
                <g id="Layer_2" data-name="Layer 2">
                    <g id="Layer_1-2" data-name="Layer 1">
                        <g id="PlusMinus">
                            {/* <image class="cls-2" width="31" height="16" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAARCAYAAAC8XK78AAAACXBIWXMAAAsSAAALEgHS3X78AAABZ0lEQVRIS8XV3U7bQBAF4M8khQqVn4uCoFKvWvWuV3n/R8gbFIkrSPmRimjTQhIvF7OLHUNbsII40mi9sj1zZs7sbJVS8poYtjfj8bjKj921L1J7HY1GD7KtSgVy8DUMWlbpTyJlW2Ce19QlUaWUSvAB1rGZbUNUqA+JhFoE/o1feZ3pkBi2Ml/HDvawj11BolTiOUgi2BQXmOBSQ+oepQcGIus9fMFnHOCdTp88ETVuRdBjkcAf3MhSlA9LiQuBfXzCV3zEFt54PmqR/UQE+45TEWcJJbsiwRbe4xAfsK1fBRZC97mQ9a2/9NPag19Xg3YTzgShWnMy7lGyK5pdi6Y5ze+u9ZNghp84wRmuNPovYag5q9P88ZEo07n+TTgXBCb4JvxOdRqQxnkhcJ73P/Q/hiWhG+HnTPgtBJbwEoOo6DwXJKbZbrF4dBKy8lHcHsPF6n/eBaz8MvrvRUSHwGvgpebAk3EHZhSWwHAKR2wAAAAASUVORK5CYII="/> */}
                            <image style={{opacity: 0.5, mixBlendMode: 'multiply'}} width="31" height="16" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAARCAYAAAC8XK78AAAACXBIWXMAAAsSAAALEgHS3X78AAABZ0lEQVRIS8XV3U7bQBAF4M8khQqVn4uCoFKvWvWuV3n/R8gbFIkrSPmRimjTQhIvF7OLHUNbsII40mi9sj1zZs7sbJVS8poYtjfj8bjKj921L1J7HY1GD7KtSgVy8DUMWlbpTyJlW2Ce19QlUaWUSvAB1rGZbUNUqA+JhFoE/o1feZ3pkBi2Ml/HDvawj11BolTiOUgi2BQXmOBSQ+oepQcGIus9fMFnHOCdTp88ETVuRdBjkcAf3MhSlA9LiQuBfXzCV3zEFt54PmqR/UQE+45TEWcJJbsiwRbe4xAfsK1fBRZC97mQ9a2/9NPag19Xg3YTzgShWnMy7lGyK5pdi6Y5ze+u9ZNghp84wRmuNPovYag5q9P88ZEo07n+TTgXBCb4JvxOdRqQxnkhcJ73P/Q/hiWhG+HnTPgtBJbwEoOo6DwXJKbZbrF4dBKy8lHcHsPF6n/eBaz8MvrvRUSHwGvgpebAk3EHZhSWwHAKR2wAAAAASUVORK5CYII="/>
                            {/* <path class="cls-3" d="M23.4,5.41v.77a2.11,2.11,0,0,1-2.11,2.11H5.52A2.11,2.11,0,0,1,3.4,6.18V5.41A2.12,2.12,0,0,1,5.52,3.29H21.29A2.12,2.12,0,0,1,23.4,5.41Z"/> */}
                            {/* <path style={{fill:'#d4d4d4'}} d="M23.4,5.41v.77a2.11,2.11,0,0,1-2.11,2.11H5.52A2.11,2.11,0,0,1,3.4,6.18V5.41A2.12,2.12,0,0,1,5.52,3.29H21.29A2.12,2.12,0,0,1,23.4,5.41Z"/> */}
                            <path className={styles.color} d="M23.4,5.41v.77a2.11,2.11,0,0,1-2.11,2.11H5.52A2.11,2.11,0,0,1,3.4,6.18V5.41A2.12,2.12,0,0,1,5.52,3.29H21.29A2.12,2.12,0,0,1,23.4,5.41Z"/>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    )
}



const Minus: React.FC<Minus> = ({ className, onClick, small }) => {

    const sty = small ? { marginLeft: '0.075rem', marginTop: '0.08rem' } : {};

    return (
        <ButtonBackground smallCircle={small} onClick={onClick} className={`${className} ${styles.hover}`}>
            {/* <img style={sty} className={styles.svg} src={minus} alt='plus' width={'100%'} height={"100%"} /> */}
            <MinusSVG/> 
        </ButtonBackground>
    )
}

export default Minus;