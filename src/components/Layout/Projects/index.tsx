import React, { useEffect, useState } from 'react';
import Div100vh from 'react-div-100vh';
import { Link, NavLink } from 'react-router-dom';
import { useHistory } from 'react-router'

import { userProps } from '../../../App';

import axios from 'axios';

import styles from './style.module.scss';
import Logo from '../Logo';
import { Track } from '../../../store/Track';
import { Sequencer } from '../../../store/Sequencer';

import Plus from '../../UI/Plus';
import TrashCan from '../../UI/TrashCan';
import Dropdown from '../../UI/Dropdown';

const Projects: React.FC<userProps> = ({
    errorMessage,
    isAuthenticated,
    token,
    updateUser,
}) => {

    const history = useHistory()
    const [projects, setProjects] = useState<string[]>([]);
    
    const [selected, setSelected] = useState<string>('');
    const [track, setTrack] = useState<Track | undefined>(undefined);
    const [sequencer, setSequencer] = useState<Sequencer | undefined>(undefined)

    const [newProjectModal, setNewProjectModal] = useState(false);

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

    // if projct in state, send to app 
    useEffect(() => {
        if (track && sequencer){
            history.push('/app', {track: track, sequencer: sequencer});
        }
    }, [track, sequencer])

    // fetch project names;
    useEffect(() => {
        axios.post(process.env.REACT_APP_SERVER_URL + '/users/userDataList', undefined, {headers: {authorization: token}})        
            .then(response => {setProjects(response.data.projects)})
            .catch(response => {console.log(response) ; postError(response)})
    }, [])

    // load project to state
    async function loadProject(name: string): Promise<void> {
        axios.post(process.env.REACT_APP_SERVER_URL + '/getData', {name: name}, {headers: {authorization: token}})
            .then(response => { setTrack(response.data.track) ; setSequencer(response.data.sequencer) })
            .catch(response => { postError(response.data.error)})
    }

    async function renameProject(e: React.FormEvent<HTMLFormElement>): Promise<void>{
        const input = e.currentTarget.getElementsByTagName('input')[0];
        if ( input.value && input.value[0] !== '#'){
            axios.post(
                process.env.REACT_APP_SERVER_URL + '/users/updateData', 
                {
                    modelType: 'project', 
                    name: selected, 
                    rename: true, 
                    newName: input.value
                }
            )
        }
    }

    async function newProject(name: string){
        axios.post(
            process.env.REACT_APP_SERVER_URL + '/users/newProject', 
            {name: name}, 
            {headers: {authorization: token}}
        ).then(res => {
            if (res.status === 200)
                history.push('/app', {...res.data})
        }).catch(err => {
            history.push('/app')
        })
    }
    
    async function deleteProject(name: string){
        axios.post(
            process.env.REACT_APP_SERVER_URL + '/users/deleteData', 
            {name: name}, 
            {headers: {authorization: token}}
        )
    }

    const postError = (err: any) => {
        updateUser({
            errorMessage: err,
            isAuthenticated: false,
            token: ''
        });
    };

    async function onSubmit(e: React.MouseEvent){ 
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
                <div className={styles.overlay}>
                    <div className={styles.select}> Select Project </div>
                    
                    <div className={styles.buttons}>
                        <Dropdown 
                            dropdownId={'projectSelector'} 
                            select={setSelected}
                            selected={selected}
                            value={selected}
                            dontDrop={true}
                            keyValue={[[ selected, selected ]]}
                            renamable={true}
                            onSubmit={(e) => renameProject(e)}
                        />
                        <Plus onClick={() => {setNewProjectModal(true)}}/> 
                        <TrashCan onClick={() => {deleteProject(selected)}} />
                    </div>
                    <div className={styles.selector}>
                        <ul className={styles.projectList}>
                            {
                                projects.map(project => (
                                    <li onClick={() => {setSelected(project)} } className={styles.projectItem}>{ project }</li>
                                ))
                            }
                        </ul>
                    </div>
                    <button onClick={(e) => onSubmit(e)} className={styles.loadProject}>Load Project</button>

                    <div className={styles.division}></div>
                    <div className={styles.errorMessage}>{ errorMessage && errorMessage.length > 0 ? errorMessage : ''}</div>
                    

                </div>
            </main>
        </Div100vh>

    )
}

export default Projects;