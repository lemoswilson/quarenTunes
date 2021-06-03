import React, { useEffect, useRef, useState } from 'react';
import Div100vh from 'react-div-100vh';
import { Link, NavLink } from 'react-router-dom';
import { useHistory } from 'react-router'

import { userProps } from '../../../App';

import axios from 'axios';

import styles from './style.module.scss';
import Logo from '../Logo';
import { Track } from '../../../store/Track';
import { Sequencer } from '../../../store/Sequencer';


const Projects: React.FC<userProps> = ({
    errorMessage,
    isAuthenticated,
    token,
    updateUser,
}) => {

    const history = useHistory()
    const username = useRef<HTMLInputElement>(null);
    const email = useRef<HTMLInputElement>(null);
    const password = useRef<HTMLInputElement>(null);
    const [projects, setProjects] = useState<string[]>([]);
    
    const [selected, setSelected] = useState<string>('');
    const [track, setTrack] = useState<Track | undefined>(undefined);
    const [sequencer, setSequencer] = useState<Sequencer | undefined>(undefined)

    const signOut = () => {
        localStorage.removeItem('xolombrisJWT')
        updateUser({
            errorMessage: '',
            isAuthenticated: false, 
            token: '',
        })
    }

    useEffect(() => {
        if (!isAuthenticated){
            updateUser({errorMessage: '', isAuthenticated, token})
            history.push('/');
        }
    }, [])

    useEffect(() => {
        if (track && sequencer){
            history.push('/app', {track: track, sequencer: sequencer});
        }
    }, [track, sequencer])

    // fetch project names;
    useEffect(() => {
        axios.post(process.env.REACT_APP_SERVER_URL + '/getDataList', undefined, {headers: {authentication: token}})        
            .then(response => {setProjects(response.data.projects)})
            .catch(response => {postError(response.data.error)})
    }, [])

    async function loadProject(name: string): Promise<void> {
        axios.post(process.env.REACT_APP_SERVER_URL + '/getData', {name: name}, {headers: {authorization: token}})
            .then(response => { setTrack(response.data.track) ; setSequencer(response.data.sequencer) })
            .catch(response => { postError(response.data.error)})
    }

    const postError = (err: any) => {
        updateUser({
            errorMessage: err,
            isAuthenticated: false,
            token: ''
        });
    };

    const onSubmit = async (e: React.MouseEvent) => { 
        try {
            loadProject(selected);
        } catch (err) {
            postError(err.data.error)
        }
    }

    
    return (
        <Div100vh className={styles.home}>
            <nav className={styles.nav}>
                <div className={styles.logo}>
                    <Logo className={styles.xolombrisx} />
                </div>
                <div className={styles.links}>
                    <div className={styles.navBox}> 
                        <div className={`${ styles.text }`}>
                            <NavLink 
                                className={styles.ss}  
                                activeStyle={{
                                    textDecoration: 'none', 
                                    color: '#ffffff', 
                                    borderBottom: '0.5px solid white'
                                }} to={'/'}> Home </NavLink>
                        </div>
                    </div>
                    <div className={styles.navBox}>
                            <div className={styles.text}>
                                <span className={styles.ss}>{
                                    <Link onClick={signOut} to={'/login'}>Sign Out</Link>
                                }</span> 
                            </div>
                    </div>
                </div>
            </nav>
            <main className={styles.projects}>
                <form className={styles.overlay}>
                    <div className={styles.select}> Select Project </div>

                    <section className={styles.selector}>
                        <ul className={styles.projectList}>
                            {
                                projects.map(project => (
                                    <li onClick={() => {setSelected(project)} } className={styles.projectItem}>{ project }</li>
                                ))
                            }
                        </ul>
                    </section>
                    <button onClick={(e) => onSubmit(e)} className={styles.create}>Load Project</button>

                    <div className={styles.division}></div>
                    <div className={styles.errorMessage}>{ errorMessage && errorMessage.length > 0 ? errorMessage : ''}</div>
                    

                </form>
            </main>
        </Div100vh>

    )
}

export default Projects;