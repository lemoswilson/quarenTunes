import React from 'react';

const RedTriangle = () => {
    return (
        // <svg width={'2.5rem'} height={'1.5rem'} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="35 25 41 37" preserveAspectRatio={'xMaxYMid slice'}>
        //     <title>grayTriangle</title>
        //     <g>
        //         <polyline points="36.74 37.34 44.44 49.17 52.16 37.34 59.87 49.17 67.58 37.34 75.29 49.17" style={{ fill: "none", stroke: "#acacac", strokeMiterlimit: 10 }} />
        //         <image width="112" height="87" xlinkHref="data:image/png;base64,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" />
        //     </g>
        // </svg>
        <svg width={'2.5rem'} height={'1.5rem'} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="35 25 41 37" preserveAspectRatio={'xMaxYMid slice'}>
            <title>redTriangle_1</title>
            <g>
                <polyline points="36.74 37.44 44.44 49.27 52.16 37.44 59.87 49.27 67.58 37.44 75.29 49.27" style={{ fill: "none", stroke: "#ea8686", strokeMiterlimit: 10 }} />
                <image width="112" height="87" xlinkHref="data:image/png;base64,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" />
            </g>
        </svg>

    )
};

export default RedTriangle;