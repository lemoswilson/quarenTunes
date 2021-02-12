import React from 'react';
import ButtonBackground from '../ButtonBackground';
import styles from './style.module.scss';

interface Save {
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

interface Icon {
    className?: string;
}

const Icon: React.FC<Icon> = ({ className }) => {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="-2.5 -3 31 31">
            <g style={{ isolation: 'isolate' }}>
                <g>
                    <g>
                        <image width="31" height="31" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsSAAALEgHS3X78AAACFklEQVRYR+3Xz07bQBAG8J8JFEqRaFVR0UN7Qj32wvs/gt+g6qEglQapCipQ/sRxD7Mb1iZESRVoD3zSaO2NM/PNt2vvTNW2rRJ1XVfpsj8uirYcDw8PuwF6qEoCKfgaBoVVFifRJpugSTZB+xCRKYEUfIAX2E62iXWLkcjBG1zjCr9xg1tMZpGo2rYtM9/ELvbwDq/TXFZiHnLmNzjHz2QjXAhSTZ/EenE9EFnv4RMOsI+d3nPz0IjMR/iOY3zDCc5wVdd1R4nsOMu/LTI/wGd8EAQ2LIZGKHAmgn4VPiuMi9/vESAIbArZ90Xwj5ZTIG++S7wV/5Xuz4U647qup5uyVKBK91t4lf6cbWAx5I34UiRDBB7ih1iaa0ES3czyRlxL89ny67goWuGDUGEf7/FGEPslYrWKB0tUhf0NciIbYv13k+2IV7wTcxaBVSAnkL8rW2m892F7LAJ0l3RQXHeUfUwCGXOX9CkIzMUzgWcCzwRmEWgLWwXm+isPo1zRTMTZnW16ci2JRtdP9j2zIsoMx+LMvhDH6HnvuWUwdufjQqoF9NQoHediciSqmaM0v0xFVOJWBD8S/u7VAnQVyJXMEF/S/NByFVGJrMCJ8DcU/htzFLjEabofWa4qLlGW5yMR/NQdgSlW2ReUKPfUtQh8KQrSTmm+6s6oRNmoTLukfl9QPUJvWKItxwc7o3+J//JT/KT4Axgv1mR0nSa6AAAAAElFTkSuQmCC" style={{ opacity: 0.5, mixBlendMode: 'multiply' }} />
                        <path d="M23.73,7.48V21A1.69,1.69,0,0,1,22,22.7H5.65A1.69,1.69,0,0,1,4,21V4.63A1.69,1.69,0,0,1,5.65,2.94H19.9C22,2.94,23.73,5,23.73,7.48Z" style={{ fill: '#d4d4d4' }} />
                    </g>
                    <rect x="6.61" y="4.25" width="14" height="6.35" rx="1.48" style={{ fill: '#f5f8fa' }} />
                    <g>
                        <image width="14" height="16" transform="translate(11 2)" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAARCAYAAAACCvahAAAACXBIWXMAAAsSAAALEgHS3X78AAABEklEQVQ4T6XTy06CMRAF4O/n4gVDjLowujFx4wPw/o/AG7iWoGGhiajAT110igU0MXqSpu3MnDmdaduklPwVvXozHo+bWJa5IMFoNNpSaopyEBt05aSdiFljhRapTtCklGpiH8cY4DBiPjDHG5Z1gvrY3SBe4BKnYX/GFDNfp1CTm1if4Ap3uA7fg1zCu3yKVvRgV/kI57jBbdj7eMIkYjaolYv6EYY4C98wbL0qboucYpSaljHEvApfidsik2v5wIvcoEHYp2Er9W5QK7fylTziHq/hm4RtrmpWTbZDbmMmq84q8ga7L6yLA7lBBxGzkK9pgXbvhRVEgk41yI1aY/3j265RfRDsf4iCb8m/Rcc/8AmeCnBwyPNZ4gAAAABJRU5ErkJggg==" style={{ opacity: 0.5, mixBlendMode: 'multiply' }} />
                        <rect x="15.14" y="5.21" width="2.94" height="4.92" rx="1.05" style={{ fill: '#d4d4d4' }} />
                    </g>
                    <rect x="5.26" y="14.46" width="16.56" height="6.67" rx="2.06" style={{ fill: '#f5f8fa' }} />
                </g>
            </g>
        </svg>
    )
}

const Save: React.FC<Save> = ({ className, onClick }) => {
    return (
        <ButtonBackground onClick={onClick} className={`${className} ${styles.hover}`}>
            <Icon className={styles.svg}></Icon>
        </ButtonBackground>
    )
}

export default Save;