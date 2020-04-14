import React from 'react';
import './Layout.scss';
import Arranger from '../../containers/Arranger/Arranger';
import Transport from '../../containers/Transport/Transport';
import Mixer from '../../containers/Mixer/Mixer';
import MainWindow from '../../containers/MainWindow/MainWindow' ;
import Chat from '../../containers/Chat/Chat';
import Sequencer from '../../containers/Sequencer/Sequencer';

const Layout = (props) => {
    return(
        <div className="mainWrapper">
            <div className="topWrapper">
              <Arranger></Arranger>
              <Transport></Transport>
              <Mixer></Mixer>
            </div>
            <MainWindow></MainWindow>
            <div className="bottomWrapper">
              <Chat></Chat>
              <Sequencer></Sequencer>
            </div>
        </div>
    )

}

export default Layout;