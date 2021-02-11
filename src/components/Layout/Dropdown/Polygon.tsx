import React from 'react';

interface Polygon {
    className?: string;
}

const Polygon: React.FC<Polygon> = ({ className }) => {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="2 -3 21 21">
            <g style={{ isolation: 'isolate' }}>
                <g>
                    <image
                        width="21"
                        height="21"
                        xlinkHref='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAACXBIWXMAAAsSAAALEgHS3X78AAABt0lEQVQ4T7XV21ITQRDG8V8OBpWTqJw8wY033ub9HyHPYJWlJR4QFTEQEtaL7oVJsgFTpV3VNTszO//5Zra7t1VVlWVtMBi0yn6/35+DtP4WnLAW2uk1/AoTVOUGd4JngF300rsCeo4LXCrg3UaaRuAKVrGe3hPAY5yITcb1+jnwLcBNPMUOHuOeAL7FKH2CecUJbeeiWeAeXuAZtoTCdzjFF/wsWdfghHYK4Ba2sZ/Al9lu40ECz7EmhNQnnQYLpT1sYBevcIiDBO4L5Wv5/mc8FNAySpDg4gpWhNJDvMFrAd7J8dVccyFEdJqgNCteE8r28VyofyKgPQEZWwCsrT3Tr8RHGYn7G5qO00nOV+kLrVR8JQDf8QH3c2yIM3GKzRwfpy/cpEvk+mAwmAh133JumM9HbiJiT9x1B7/y/UsN8FJxJVScFe0JPuG9m5DbFZl3hq/ZzsGvwan6ys1djvAbPxJwlBvs4pG4ho8ipYe55toai9Atab0hoOs5fyri+VietC5Ct1a3BRvU3hanGqZPVbc7yyaNtbiT/boWL1+PSyv+HGViVMz/RZYCL2OzmffP7L+B/wCCCrWkEKEwrQAAAABJRU5ErkJggg=='
                        style={{ opacity: 0.5, mixBlendMode: 'multiply' }} />
                    <polygon points="3.92 7.7 13.92 2.7 13.92 12.7 3.92 7.7" style={{ fill: '#d4d4d4' }} />
                </g>
            </g>
        </svg>
    )
}

export default Polygon;