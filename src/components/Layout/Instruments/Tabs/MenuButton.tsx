import React, { MutableRefObject, useEffect, useRef } from 'react';
import styles from './menuButton.module.scss';

interface MenuButtonProps {
    onClickSVG?: (this: SVGSVGElement, e: MouseEvent) => void;
    className?: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClickSVG , className }) => {
    const svgRef: MutableRefObject<SVGSVGElement | null> = useRef(null)
    

    useEffect(() => {
        const svg = svgRef.current
        if (onClickSVG) 
            svg?.addEventListener('click', onClickSVG)
        // svgRef.current?.addEventListener('click', onClick)
        return () => {
            if (onClickSVG) 
                svg?.removeEventListener('click', onClickSVG)
            // svgRef.current?.removeEventListener('click', onClick)
        }
    }, [])

    return (
        // <svg onClick={onClick} className={styles.menuButton} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 22 22">
        <svg ref={svgRef} className={`${styles.menuButton} ${className}`} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 22 22">
            <title>menu</title>
            <g style={{isolation: "isolate"}}>
                <g>
                <g>
                    <image width="22" height="12" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAANCAYAAABCZ/VdAAAACXBIWXMAAAsSAAALEgHS3X78AAABEUlEQVQ4T7XTTUtCQRgF4EcTs9r0QUFEv6Fgdv3/7SyiFu2CqKRPCtREvN4WM6apdS3qwDDcucN5z5z3vLWyLP0XGrMHMcYa6qjNX/8SJUYhhE9Ka2PlmXQFTbTyXleNEQbo570YF5lWvoIN7GEfm1KB715QSoSvaOMenRhjEUIoG3yobkrEx3kdYE01eR+3OMcZrtDBcKy8LlmxjyOc4DCfVZEPcIet/P2GQYyxmLVlHdvYxQ5WVTe2yPf6uMElHtCfJi/Qw3P+2VKtnNTQnvSCMi9MGjqSKrdxKhEu4zkTK65xgUe50HQUG36eFia+v5gkphtCGM7a0pV8e7J8zlmQdaaGaIxfTigLpnSO/C/xDhyVb0fGHyayAAAAAElFTkSuQmCC" style={{opacity: 0.5, mixBlendMode: "multiply"}}/>
                    <path d="M17.34,3.87v.57A1.56,1.56,0,0,1,15.78,6H4.09A1.57,1.57,0,0,1,2.52,4.44V3.87A1.57,1.57,0,0,1,4.09,2.3H15.78A1.56,1.56,0,0,1,17.34,3.87Z" style={{fill: "#d4d4d4"}}/>
                </g>
                <g>
                    <image width="22" height="12" transform="translate(0 5)" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAANCAYAAABCZ/VdAAAACXBIWXMAAAsSAAALEgHS3X78AAABGElEQVQ4T7XTvUsDQRQE8F9iiIpCFPxACxsLG8Xiav//6iot7ARRgxpBIdEQcjmLvc2dSTyD6DTL7fHmzZud18jz3H+htegyTdMGmmgs+r8AOSZJknxR2qgqL0hX0MZacTbVY4IRhsWZxSZT8grxJvZwgI7Q4LsJcoHwDV08oa9oULUlEh/hDKc4FCaoIx/iAVe4xK3QYNxiqrqNXYH0AufYt5zyR2wX3x8YpWmaReWRfAfHOBEm6AgT1SHDqjDBPW7wjOFsWnKlmr7wWMs86LtQE+tRRjES9nAt+NzFup/jGK24E2p7ikbVtLSwoUzKlnq/I6KwV2ViBkmSjKu2ZBgIvr1YLuMRc1lnZon41XZGzG3pHPlf4hNnLHSglNzq1QAAAABJRU5ErkJggg==" style={{opacity: 0.5, mixBlendMode: "multiply"}}/>
                    <path d="M17.34,9v.57a1.56,1.56,0,0,1-1.56,1.56H4.09A1.56,1.56,0,0,1,2.52,9.56V9A1.57,1.57,0,0,1,4.09,7.42H15.78A1.56,1.56,0,0,1,17.34,9Z" style={{fill: "#d4d4d4"}}/>
                </g>
                <g>
                    <image width="22" height="12" transform="translate(0 10)" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAANCAYAAABCZ/VdAAAACXBIWXMAAAsSAAALEgHS3X78AAAA1UlEQVQ4T7XTP0sDQRAF8N+aIIpNClEUCztbYb//RzhIax8V5QQbSZAka7G7yaFgLsZ7MAwMs2/e/NmQUjIUjnYlHILx90DTNEEuGn6m/4qEdYxxM4pQx1JIRzjGSfF9O1vjE4viVzHG1FU+whkucIWJXGBXB0kmfMczXvGBZUgpVdWnuMZ9sZsS60M+xwzTYk+YV+VBVnmOO0Tc2o/80rZIi0Xfmf4JVXmdW4sHWfGL/ZTP5LetzJW61zL2jwuNMS6717KSt/yINweeIp07rxjkEw2BLymGW+TOUlZMAAAAAElFTkSuQmCC" style={{opacity: 0.5, mixBlendMode: "multiply"}}/>
                    <path d="M17.34,14.11v.57a1.56,1.56,0,0,1-1.56,1.56H4.09a1.56,1.56,0,0,1-1.57-1.56v-.57a1.57,1.57,0,0,1,1.57-1.57H15.78A1.56,1.56,0,0,1,17.34,14.11Z" style={{fill: "#d4d4d4"}}/>
                </g>
                </g>
            </g>
        </svg>

    //    <div className={styles.menuButton} onClick={onClick}>
    //        <div className={styles.dash}></div>
    //        <div className={styles.dash}></div>
    //        <div className={styles.dash}></div>
    //    </div> 
    )
};


export default MenuButton;
