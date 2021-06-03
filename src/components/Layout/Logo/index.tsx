import React from 'react';

const Logo: React.FC<{className?: string}> = ({ className }) => {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28.72 43.08">
            <title>xologo</title>
            <path d="M0,43.08v-12q0-8.45,9.56-9.56Q0,20.42,0,12V0H9.56V14.36A4.65,4.65,0,0,0,11,17.74a4.74,4.74,0,0,0,6.77,0,4.62,4.62,0,0,0,1.42-3.38V0h9.56V12q0,8.44-9.56,9.56,9.56,1.17,9.56,9.58v12H19.16V28.72a4.59,4.59,0,0,0-1.42-3.39,4.77,4.77,0,0,0-6.77,0,4.62,4.62,0,0,0-1.41,3.39V43.08Z" style={{fill: "#fff"}}/>
        </svg>

    )
}

export default Logo;