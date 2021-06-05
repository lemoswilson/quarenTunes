import React, { useState } from 'react';
import { userProps } from '../../../App';
import styles from './style.module.scss';
import Div100vh from 'react-div-100vh';
import Curves from './Curves';
import Logo from '../Logo';
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

    // useEffect(() => {
    //     if (!br)
    //         sorta();
    // }, [br])

    // useEffect(() => {
    //     colorr()
    // }, [])

    // const colorr = () => {
    //     setTimeout(() => {
    //         setCol(v => v + 1)

    //         colorr();
    //     }, 400)
    // }
    
    const midStyle: React.CSSProperties = isAuthenticated ? {justifyContent: 'center'} : {};

    return (
        <Div100vh className={styles.home}>
            <nav className={styles.nav}>
                <div className={styles.logo}>
                    <Logo className={styles.xolombrisx} />
                </div>
                <div className={styles.links}>
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
            <main onClick={() => setBreak(b => !b)} className={styles.curves}>
                <Curves className={styles.joia} lineClass={styles.lineClass}/>
                <h1 className={styles.title}>Find Your <br />Patterns</h1>
                <div className={styles.buttons} style={midStyle}>
                    <div className={styles.playRegister}>
                        <div className={styles.text}>
                            < Link
                                to={'/app'} 
                                style={{textDecoration: 'none', color: 'white'}} 
                            > Play Now </Link></div>
                    </div>
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
        </Div100vh>
    )
}

export default HomePage;