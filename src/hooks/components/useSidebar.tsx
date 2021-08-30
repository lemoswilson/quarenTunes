import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './sidebar.module.scss';
import X from '../../components/UI/X';


export default function useSidebar(){
	const [isOpen, setState] = useState(false);
	const [off, setOff] = useState(false);
	const [firstRender, setRender] = useState(true);
	const mediaQuery = window.matchMedia("(orientation: portrait)")

	useEffect(() => {
		mediaQuery.addEventListener('change', onChangeOrientation)

		return () => {
			mediaQuery.removeEventListener('change', onChangeOrientation);
		}
	}, [])


	function onChangeOrientation(this: MediaQueryList, e: MediaQueryListEvent){
		if (isOpen){
			toggleSidebar()
		}
	}

	function toggleSidebar(){
		if (firstRender)
			setRender(false);

		if (isOpen) {
			setOff(true)
			setTimeout(() => {
				setOff(false);
			}, 220)
		}

		setState(state => !state)
	}

	const sidebarClass = isOpen 
		? `${styles.sidebar} ${styles.open}` 
		: off && !firstRender
			? `${styles.sidebar} ${styles.close}`
			: `${styles.sidebar}`

	function closeSidebar(){
		if (isOpen)
			toggleSidebar()
	}

	return {
		sidebarClass,
		Sidebar,
		toggleSidebar,
		closeSidebar
	}			

}

export interface pagesInfo {
	[page: string]: {
		path?: string,
		func?: () => void,
		text: string
	}
}

interface sidebarProps {
	className?: string, 
	style?: React.CSSProperties,
	pages: pagesInfo,
	openClose: () => void,
}


const Sidebar: React.FC<sidebarProps> = ({className, style, pages, openClose}) => {



	return (
		<div className={className} style={style}>
			<X onClick={openClose} color={'white'} className={styles.x}/>
			<ul className={styles.linkList}>
				{ Object.values(pages).map(page => {
					return (
						page.path ? 
						<li key={page.text} className={styles.link}><Link to={page.path}>{page.text}</Link></li>
						: <li key={page.text} onClick={page.func} className={styles.link}>{page.text}</li> 
					)
				})}
			</ul>
		</div>
	)
}