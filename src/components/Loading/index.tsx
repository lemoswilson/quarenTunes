import React from 'react';
import styles from './style.module.scss';
import loading from '../../assets/loading.svg';

const Loading: React.FC = () => {
	return (
		<div className={styles.loading}>
			<img src={loading} alt="loading" className={styles.image} />	
		</div>
	)
}

export default Loading;