import React, { useState } from 'react';
import { userProps } from '../../../App';
import styles from './style.module.scss';
import Div100vh from 'react-div-100vh';
import Curves from './Curves';
import Logo from '../Logo';
import { isMobile, isTablet, isMobileOnly, MobileOnlyView } from 'react-device-detect';
import { Link, NavLink } from 'react-router-dom';
import useQuickRef from '../../../hooks/lifecycle/useQuickRef';
import { useVerify } from '../../../hooks/fetch/useFetch';

const HomePage: React.FC<userProps> = ({
    errorMessage,
    isAuthenticated,
    token,
    updateUser
}) => {

    const [br, setBreak] = useState(false);
    const ref_br = useQuickRef(br);

    const signOut = () => {
        localStorage.removeItem('xolombrisJWT')
        updateUser({
            errorMessage: '',
            isAuthenticated: false, 
            token: '',
        })
    }

    const [ rotate, setRotate ] = useState(0);
    const sorta = () => {
        requestAnimationFrame(() => {
            setRotate(v => v + 0.7);

            if (!ref_br.current)
                sorta();
        })
    }

    useVerify({errorMessage, isAuthenticated, token}, updateUser)

    const midStyle: React.CSSProperties = isAuthenticated ? {justifyContent: 'center'} : {};
    const authStyle: React.CSSProperties = isAuthenticated ? {display: 'none'} : {};

    return (
        <Div100vh className={styles.home}>
            <nav  className={styles.nav}>
                <div className={styles.logo}>
                    <Logo className={styles.xolombrisx} style={isMobileOnly ? {width: '6rem', height: '6rem', marginTop: '3rem', marginLeft: '3rem'} : isMobile ? {width: '3rem', height: '3rem'} : {}} />
                </div>
                <div className={styles.links} style={isMobileOnly ? {display: 'none'} : {}}>
                    <div className={styles.navBox}> 
                        <div className={`${ styles.text }`}>
                        {
                            isAuthenticated 
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
                        <div onClick={isAuthenticated ? signOut : () => {}} className={styles.text}>
                            <span className={styles.ss}>{
                                !isAuthenticated 
                                ? <Link to={'login'}>Sign In</Link>
                                : 'Sign Out'
                            }</span> 
                        </div>
                    </div>
                </div>
            </nav>
            <main style={isMobileOnly ? {display: 'none'} : {}} onClick={() => setBreak(b => !b)} className={styles.curves}>
                <Curves className={styles.joia} lineClass={styles.lineClass}/>
                <h1 className={styles.title}>Find Your <br />Patterns</h1>
                <div className={styles.buttons} style={midStyle}>
                    {
                        !isMobile
                        ? <div className={styles.playRegister}>
                            <div className={styles.text}>
                                < Link
                                    to={'/app'} 
                                    style={{textDecoration: 'none', color: 'white'}} 
                                > Make Music </Link></div>
                        </div>
                        : null
                    }
                    { 
                        !isAuthenticated 
                        ? <div className={styles.playRegister}>
                            <div className={styles.text}> 
                                <Link 
                                    style={{textDecoration: 'none', color: 'white'}} 
                                    to={'/signup'}> Register </Link> 
                            </div>
                        </div>
                        : null
                    }
                </div>
            </main>
            <MobileOnlyView>
                <div className={styles.title}>
                    Find Your <br/>Patterns
                </div>
                <Curves className={styles.joia} lineClass={styles.lineClass}/>
                <div className={styles.links}>
                    <div style={authStyle} className={styles.btt}><Link style={{textDecoration: 'none'}} to={'/signup'}>Register</Link></div>
                    <div style={authStyle} className={styles.btt}><Link style={{textDecoration: 'none'}} to={'/login'}>Login</Link></div>
                    <div className={styles.btt}><Link style={{textDecoration: 'none'}} to={'/app'}>Make Music</Link></div>
                </div>
            </MobileOnlyView>
            
        </Div100vh>
    )
}

export default HomePage;
