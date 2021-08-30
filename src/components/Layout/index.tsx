import React, { 
    MutableRefObject, 
    useContext, 
    useState, 
    useEffect, 
    useCallback, 
    useRef,
    useLayoutEffect
} from 'react';
import { useSelector } from 'react-redux';
import useSidebar, { pagesInfo } from '../../hooks/components/useSidebar';
import { NavLink, Link, useHistory } from 'react-router-dom';
import styles from './style.module.scss';
import mobileStyles from './mobile.module.scss';

import { Sequencer as SequencerType } from '../../store/Sequencer';
import { Track as TrackType } from '../../store/Track';
import axios from 'axios';

import Div100vh from 'react-div-100vh';
import ToneObjects, { triggs } from '../../context/ToneObjectsContext';

import TrackComponent from '../../containers/Track';
import SequencerComponent from '../../containers/Sequencer';
import Transport from '../../containers/Transport';
import Save from '../UI/Save';
import Logo from './Logo';

import * as Tone from 'tone';

import useWebMidi from '../../hooks/store/Midi/useWebMidi';
import useTrackEmitter from '../../hooks/emitters/useTrackEmitter';
import useTriggEmitter from '../../hooks/emitters/useTriggEmitter';
import useMenuEmitter from '../../hooks/emitters/useMenuEmitter';
import useDropdownEmitter from '../../hooks/emitters/useDropdownEmitter';

import MenuContext from '../../context/MenuContext';
import DropdownContext from '../../context/DropdownContext';
import UserDataContext from '../../context/userDataContext';
import ModalContext from '../../context/modalContext';

import Chain from '../../lib/Tone/fxChain';
import { returnEffect, returnInstrument, reconnect } from '../../lib/Tone/initializers';
import { trackSelector } from '../../store/Track/selectors';
import { sequencerSelector } from '../../store/Sequencer/selectors';
import { userData } from '../../App';
import X from '../UI/X';
import { serializeSequencer } from '../../lib/utility';
import Burger from '../UI/Burger';
import { isChrome, isMobile, isMobileOnly, isTablet } from 'react-device-detect';

type ToneType = typeof Tone;


export function newPatternObject(
    Tone: ToneType,
    track?: TrackType,
): triggs[] {

    if (track)
        return [...Array(track.trackCount).keys()].map((_, trk, __) => ({
            instrument: new Tone.Part(),
            effects: [...Array(track.tracks[trk].fx.length).keys()].map(v => new Tone.Part())
        }))
    else
        return [{instrument: new Tone.Part(), effects: [new Tone.Part()]}]

}

export interface LayoutState {
    sequencer?: SequencerType,
    track?: TrackType,
    incomeName?: string,
    isAuthenticated: boolean,
    token: string | null,
    updateUser: (value: React.SetStateAction<userData>) => void,
    signOut: () => void,
}

interface LayoutProps  extends LayoutState {
    appRef: MutableRefObject<HTMLDivElement | null>
}


const Layout: React.FC <LayoutProps> = ({
    appRef,
    incomeName,
    sequencer,
    track,
    isAuthenticated,
    token,
    updateUser,
    signOut,
}) => {
    const [firstRender, setRender] = useState(true);
    const ref_toneObjects = useContext(ToneObjects);
    const ref_menus = useContext(MenuContext);
    const ref_dropdowns = useContext(DropdownContext);
    const Track = useSelector(trackSelector)
    const Sequencer = useSelector(sequencerSelector);
    const ref_tempName = useRef('');
    
    const history = useHistory();
    
    const userData = useContext(UserDataContext);
    const [name, setName] = useState('');

    const [saveModal, setSaveModal] = useState(false);
    const saveInput = useRef<HTMLInputElement | null>(null);


    useEffect(() => {
        if (incomeName) {
            setName(incomeName);
        }
    }, [])

    const help = () => {

    }

    useLayoutEffect(() => {
        if (saveModal && saveInput.current) {
            saveInput.current.focus();
            saveInput.current.value = name;
        }
    }, [saveModal])

    const saveProject = () => {
        if (!saveModal){
            setSaveModal(true);
        } else {
            axios.post(
                process.env.REACT_APP_SERVER_URL + '/users/saveData',
                {
                    name: saveInput.current?.value, 
                    modelType: 'project', 
                    project: {
                        track: Track, 
                        sequencer: serializeSequencer(Sequencer),
                    },
                    rename: true,
                }, 
                {headers: {authorization: userData.token}}

            ).then(v => {
                setName(saveInput.current ? saveInput.current.value : '');
                setSaveModal(false);
            })
            .catch(e => {
                setSaveModal(false);
            })
        } 
    };
    


    const getNewPatternObject = useCallback<() => triggs[]>(() => {
        return newPatternObject(Tone, track)
    }, [])

    const initializeTracks = () => {
        const t = sequencer && track ? track : Track
        
        t.tracks.forEach((track, trackIndex, _) => {
            ref_toneObjects.current?.tracks.push({
                chain: new Chain(), 
                instrument: returnInstrument(track.instrument, track.options),
                effects: [...Array(track.fx.length).keys()]
                    .map((__, fxIndex, _) => returnEffect(
                        track.fx[fxIndex].fx, track.fx[fxIndex].options
                    ))
            })
            reconnect(ref_toneObjects, trackIndex);
        })
    };

    const initializePattern = useCallback(() => {
        if (sequencer && track) {
            const patterns = sequencer.patterns
            Object.keys(patterns).forEach(pattern => {
                const p = Number(pattern)
                if (ref_toneObjects.current)
                    ref_toneObjects.current.patterns[p] = getNewPatternObject()
            })
        } else {
            if (ref_toneObjects.current)
                ref_toneObjects.current.patterns[0] = getNewPatternObject();
        }

        if (ref_toneObjects.current)
        Object.keys(ref_toneObjects.current.patterns).forEach(p => {
            ref_toneObjects.current?.patterns[Number(p)].forEach(trigg => {
                trigg.instrument.stop(0)
                trigg.effects.forEach(effectTrigg => {
                    effectTrigg.stop(0);
                })
            })
        })
    }, [])

    const initializeFlags = useCallback(() => {
        if (track){
            track.tracks.forEach((__, idx, _) => {
                ref_toneObjects.current?.flagObjects.push({
                    instrument: {callback: undefined, flag: false}, 
                    effects: [...Array(track.tracks[idx].fx.length).keys()].map(v => ({callback: undefined, flag: false}))
                })
            })
        } else {
            ref_toneObjects.current?.flagObjects.push({
                instrument: { callback: undefined, flag: false},
                effects: [{callback: undefined, flag: false}]
            })
        }
    }, [])

    useEffect(() => {
        if (firstRender){
            ref_toneObjects.current = {patterns: {}, tracks:[], flagObjects: []}
            initializePattern()
            initializeFlags()
            initializeTracks()
            setRender(false)
            if (sequencer && track){
                // set state to be like sequencer and track
            }
        }


    }, [])

    useWebMidi();
    useTrackEmitter(ref_toneObjects);
    useTriggEmitter(ref_toneObjects);
    useDropdownEmitter(ref_dropdowns);
    useMenuEmitter(ref_menus)

    function closeSave(){
        if (saveModal)
            setSaveModal(false);
    }

    function onSubmitNew(e: React.FormEvent){
        e.preventDefault()
        saveProject();
        closeSave();
    }

    const signOutAndHome = () => {
        signOut();
        history.push('/');
    }

    function stopProp(this: HTMLInputElement, e: KeyboardEvent) {
        e.stopPropagation();
    }

    useEffect(() => {
        const inp = saveInput.current;
        inp?.addEventListener('keydown', stopProp);
        return () => {
            inp?.removeEventListener('keydown', stopProp);
        }
    }, [])

    const { Sidebar, sidebarClass, toggleSidebar, closeSidebar} = useSidebar();

    const pages: pagesInfo = {
        home: {
            text: 'Home',
            path: '/'
        }
    }

    const message = 'Your browser/device is not optimized for the application, please reopen the app on Chrome Desktop.';

    const DesktopApp = (
        <Div100vh className={styles.app}>
            <ModalContext.Provider value={saveModal}>
            {
                !firstRender
                ? <div ref={appRef} className={styles.wrapson}>
                    <div className={styles.content}>
                        <div className={styles.top}>
                            <div className=""></div>
                            <div className={styles.transport}>
                                    <Transport saveProject={saveProject}/>
                            </div>
                            <nav className={styles.links}>
                                    <div className={styles.navBox}>
                                        <div className={`${ styles.text }`}>
                                        {
                                            userData.isAuthenticated
                                            ? <NavLink className={styles.ss} activeClassName={styles.activeLink}
                                                activeStyle={{
                                                    textDecoration: 'none',
                                                    color: '#ffffff',
                                                    borderBottom: '0.5px solid white'
                                                }}
                                                to={'/projects'}
                                            >  Projects </NavLink>
                                            : null
                                        }
                                        </div>
                                    </div>
                                    <div className={styles.navBox}>
                                        <div onClick={userData.isAuthenticated ? signOut : () => {}} className={styles.text}>
                                            <span className={styles.ss}>{
                                                !userData.isAuthenticated
                                                ? <Link to={'login'}>Sign In</Link>
                                                : 'Sign Out'
                                            }</span>
                                        </div>
                                    </div>
                                    <div className={styles.navBox}>
                                        <div onClick={help} className={styles.text}>
                                            <span className={styles.ss}>{
                                                'Help'
                                            }</span>
                                        </div>
                                    </div>
                            </nav>
                        </div>
                        <div className={styles.gap}></div>
                        <div className={styles.mid}>
                            <TrackComponent></TrackComponent>
                        </div>
                        <SequencerComponent></SequencerComponent>
                    </div>
                </div>
                : null
            }
            {
                saveModal ?
                <form onSubmit={onSubmitNew} className={styles.saveForm}>
                    <div className={styles.titlebar}>
                        <div className={styles.saveTitle}> Name your project </div>
                        <X onClick={closeSave} className={styles.x}/>
                    </div>
                    <div className={styles.interfaceables}>
                        <div className={styles.inputOverlay}>
                            <input className={styles.input} ref={saveInput} type="text" />
                        </div>
                        <Save className={styles.plus} onClick={saveProject}/>
                    </div>
                </form>
                : null
            }
            </ModalContext.Provider>
        </Div100vh>
    )
    
    const DesktopTabletNotCompatible = (
        <Div100vh className={styles.app}>
                 <div ref={appRef} className={styles.wrapson}>
                    <div className={`${ styles.content } ${styles.ctHeight}`}>
                        <div className={styles.top}>
                            <div className=""></div>
                            <div></div>
                            <nav className={`${ styles.links } ${styles.lmar}`}>
                                    <div className={styles.navBox}>
                                        <div onClick={userData.isAuthenticated ? signOut : () => {}} className={styles.text}>
                                            <span className={styles.ss}>{
                                                !userData.isAuthenticated
                                                ? <Link to={'login'}> Sign In</Link>
                                                : 'Sign Out'
                                            }</span>
                                        </div>
                                    </div>
                                    <div style={userData.isAuthenticated ? {display: 'none'} : {}} className={styles.navBox}>
                                        <div className={styles.text}>
                                            <span className={styles.ss}>
                                                 <Link to={'/signup'}> Sign Up</Link>
                                            </span>
                                        </div>
                                    </div>
                            </nav>
                        </div>
                        <div className={styles.gap}></div>
                        <div className={styles.noApp}>
                            <h1>{ message }</h1>
                        </div>
                    </div>
                </div>
        </Div100vh>
    )


    const Mobile = (
        <Div100vh className={mobileStyles.home}>
		<Sidebar openClose={toggleSidebar} pages={pages} className={sidebarClass} />            

		<nav className={mobileStyles.nav}>
			<div className={mobileStyles.logo}>
				<Logo className={mobileStyles.xolombrisx} style={{width: '3vmax', height: '3vmax', marginTop: '1.5vmax', marginLeft: '1.5vmax'}} />
			</div>

			<Burger onClick={toggleSidebar}/>                

		</nav>
		<main className={mobileStyles.signUp}>
            { message }
		</main>
	</Div100vh>

    )

    return (
        !isMobile && isChrome      
        ? DesktopApp
        : (!isMobile && !isChrome) || isTablet
        ? DesktopTabletNotCompatible
        : isMobileOnly
        ? Mobile
        : null
    )

}

export default Layout;