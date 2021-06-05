import React, { useEffect, useState, useRef } from 'react';
import Div100vh from 'react-div-100vh';
import { Link, NavLink } from 'react-router-dom';
import { useHistory } from 'react-router'

import { userProps } from '../../../App';

import axios from 'axios';

import styles from './style.module.scss';
import optionListStyles from '../Instruments/Tabs/optionList.module.scss'

import Logo from '../Logo';
import { Track } from '../../../store/Track';
import { Sequencer } from '../../../store/Sequencer';

import Plus from '../../UI/Plus';
import TrashCan from '../../UI/TrashCan';
import Dropdown from '../../UI/Dropdown';
import { useVerify } from '../../../hooks/fetch/useFetch';

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

    const ref_input = useRef<HTMLInputElement | null>(null);
    const ref_newInput = useRef<HTMLInputElement | null>(null);

    const signOut = () => {
        localStorage.removeItem('xolombrisJWT')
        updateUser({
            errorMessage: '',
            isAuthenticated: false, 
            token: '',
        })
    }

    useVerify({errorMessage, isAuthenticated, token}, updateUser)

    // if projct in state, send to app 
    useEffect(() => {
        if (track && sequencer){
            history.push('/app', {track: track, sequencer: sequencer, incomeName: selected});
        }
    }, [track, sequencer])

    // fetch project names;
    useEffect(() => {
        if (token)
            fetchData()
    }, [token])

    async function fetchData(){
        axios.post(process.env.REACT_APP_SERVER_URL + '/users/userDataList', {modelType: 'project'}, {headers: {authorization: token}})        
        .then(response => { setProjects(response.data.projects) })
        .catch(response => { postError(response) })
    }

    // load project to state
    async function loadProject(name: string): Promise<void> {
        axios.post(process.env.REACT_APP_SERVER_URL + '/users/getData', {name: name, modelType: 'project'}, {headers: {authorization: token}})
            .then(response => { setTrack(response.data.track) ; setSequencer(response.data.sequencer) })
            .catch(response => { postError(response.data.error)})
    }

    async function renameProject(e: React.FormEvent<HTMLFormElement>): Promise<void>{
        e.preventDefault();
        const input = e.currentTarget.getElementsByTagName('input')[0];
        if ( input.value ){
            axios.post(
                process.env.REACT_APP_SERVER_URL + '/users/saveData', 
                {
                    modelType: 'project', 
                    name: selected, 
                    rename: true, 
                    newName: input.value
                },
                {headers:{authorization: token}}
            ).then(response => {
                fetchData();
                setSelected(input.value);
            }).catch(res => {
                postError(res.data)
            })
        }
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
            if (selected.length > 0)
                loadProject(selected);
        } catch (err) {
            postError(err.data.error)
        }
    }

    const onBlur = (e: React.FormEvent<HTMLFormElement>) => {
        const input = e.currentTarget.getElementsByTagName('input')[0]
        input.value = selected;
    }

    const onKeyDown = (e: React.KeyboardEvent) => {
        e.stopPropagation()
        if (e.key.toLocaleLowerCase() === 'escape' && ref_input.current){
            ref_input.current.value = selected;
        }
    };

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
                        <form className={styles.form} onBlur={onBlur} onSubmit={renameProject}>
                            <input ref={ref_input} onKeyDown={onKeyDown} className={styles.input} type="text" defaultValue={selected}/>
                        </form>
                        <Plus  onClick={() => {history.push('/app')}}/> 
                        <TrashCan onClick={() => {deleteProject(selected)}} />
                    </div>
                    <div className={styles.selector}>
                        <ul className={styles.projectList}>
                            { projects.length > 0 
                                ? projects.map(project => (
                                    <li key={project} onClick={() => {setSelected(project)} } className={` ${ styles.projectItem } ${styles.pointer} ${project === selected ? styles.selectedItem : ''}`}>{ project }</li>
                                ))
                                : ( 
                                    <li className={`${ styles.projectItem }`}>No saved projects</li>
                                )
                            }
                        </ul>
                    </div>
                    <button onClick={(e) => { e.preventDefault();onSubmit(e)} } className={styles.loadProject}>Load Project</button>

                    <div className={styles.division}></div>
                    <div className={styles.errorMessage}>{ errorMessage && errorMessage.length > 0 ? errorMessage : ''}</div>
                    

                </div>
            </main>
        </Div100vh>

    )
}

export default Projects;