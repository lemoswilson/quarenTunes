import React from 'react';
import styles from './style.module.scss';

const Burger: React.FC<{className?: string, onClick?: () => void, style?: React.CSSProperties}> = ({className, onClick, style }) => {

	return (
		<svg onClick={onClick} className={`${styles.burger}`} style={style} width="152px" height="106px" viewBox="0 0 152 106" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
			<defs>
				<circle id="path-1" cx="13" cy="13" r="13"></circle>
				<filter x="-26.9%" y="-19.2%" width="153.8%" height="153.8%" filterUnits="objectBoundingBox" id="filter-2">
					<feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
					<feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
					<feColorMatrix values="0 0 0 0 0.400882228   0 0 0 0 0.261141301   0 0 0 0 0.261141301  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
				</filter>
				<circle id="path-3" cx="13" cy="49" r="13"></circle>
				<filter x="-26.9%" y="-19.2%" width="153.8%" height="153.8%" filterUnits="objectBoundingBox" id="filter-4">
					<feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
					<feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
					<feColorMatrix values="0 0 0 0 0.400882228   0 0 0 0 0.261141301   0 0 0 0 0.261141301  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
				</filter>
				<circle id="path-5" cx="13" cy="85" r="13"></circle>
				<filter x="-26.9%" y="-19.2%" width="153.8%" height="153.8%" filterUnits="objectBoundingBox" id="filter-6">
					<feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
					<feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
					<feColorMatrix values="0 0 0 0 0.400882228   0 0 0 0 0.261141301   0 0 0 0 0.261141301  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
				</filter>
				<rect id="path-7" x="34" y="0" width="110" height="26" rx="12"></rect>
				<filter x="-6.4%" y="-19.2%" width="112.7%" height="153.8%" filterUnits="objectBoundingBox" id="filter-8">
					<feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
					<feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
					<feColorMatrix values="0 0 0 0 0.400882228   0 0 0 0 0.261141301   0 0 0 0 0.261141301  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
				</filter>
				<rect id="path-9" x="34" y="36" width="110" height="26" rx="12"></rect>
				<filter x="-6.4%" y="-19.2%" width="112.7%" height="153.8%" filterUnits="objectBoundingBox" id="filter-10">
					<feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
					<feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
					<feColorMatrix values="0 0 0 0 0.400882228   0 0 0 0 0.261141301   0 0 0 0 0.261141301  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
				</filter>
				<rect id="path-11" x="34" y="72" width="110" height="26" rx="12"></rect>
				<filter x="-6.4%" y="-19.2%" width="112.7%" height="153.8%" filterUnits="objectBoundingBox" id="filter-12">
					<feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
					<feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
					<feColorMatrix values="0 0 0 0 0.400882228   0 0 0 0 0.261141301   0 0 0 0 0.261141301  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
				</filter>
			</defs>
			<g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
				<g id="iPhone-8" transform="translate(-95.000000, -156.000000)">
					<g id="Group" transform="translate(99.000000, 158.000000)">
						<g id="Oval">
							<use fill="black" fillOpacity="1" filter="url(#filter-2)" xlinkHref="#path-1"></use>
							<use fill="#FFFFFF" fillRule="evenodd" xlinkHref="#path-1"></use>
						</g>
						<g id="Oval-Copy">
							<use fill="black" fillOpacity="1" filter="url(#filter-4)" xlinkHref="#path-3"></use>
							<use fill="#FFFFFF" fillRule="evenodd" xlinkHref="#path-3"></use>
						</g>
						<g id="Oval-Copy-2">
							<use fill="black" fillOpacity="1" filter="url(#filter-6)" xlinkHref="#path-5"></use>
							<use fill="#FFFFFF" fillRule="evenodd" xlinkHref="#path-5"></use>
						</g>
						<g id="Rectangle">
							<use fill="black" fillOpacity="1" filter="url(#filter-8)" xlinkHref="#path-7"></use>
							<use fill="#FFFFFF" fillRule="evenodd" xlinkHref="#path-7"></use>
						</g>
						<g id="Rectangle-Copy">
							<use fill="black" fillOpacity="1" filter="url(#filter-10)" xlinkHref="#path-9"></use>
							<use fill="#FFFFFF" fillRule="evenodd" xlinkHref="#path-9"></use>
						</g>
						<g id="Rectangle-Copy-2">
							<use fill="black" fillOpacity="1" filter="url(#filter-12)" xlinkHref="#path-11"></use>
							<use fill="#FFFFFF" fillRule="evenodd" xlinkHref="#path-11"></use>
						</g>
					</g>
				</g>
			</g>
		</svg>
	)
};


export default Burger;