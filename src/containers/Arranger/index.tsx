import React, { FunctionComponent, useContext } from "react";

import ArrangerLayout from '../../components/Layout/Arranger';

import ToneObjectsContext from "../../context/ToneObjectsContext";
import { useTrkInfoSelector } from "../../hooks/store/Track/useTrackSelector";
import { useArrangerSelector } from "../../hooks/store/Arranger/useArrangerSelectors"
import { useArrangerDispatchers } from '../../hooks/store/Arranger/useArrangerDispatchers';
import { useArrangerScheduler } from "../../hooks/schedulers/useArrangerScheduler";

const Arranger: FunctionComponent = () => {


	const ref_toneObjects = useContext(ToneObjectsContext);
	const { activePatt, ref_selectedTrkIdx, trkCount} = useTrkInfoSelector();

	const {
		currentSong, 
        activeSongObj,
        songEvents,
        ref_songEvents,
        songLength,
        ref_isFollow,
        songs,
        arrgMode,
        prev_arrgMode,
	} 
	= useArrangerSelector()

	const arrangerDispatchers = useArrangerDispatchers(
		ref_toneObjects,
		ref_isFollow,
		activePatt,
		currentSong,
		arrgMode,
		trkCount,
		songEvents, 
		songs,
	)

	const { isPlay, pattsObj } = useArrangerScheduler(
		ref_songEvents,
		ref_toneObjects,
		ref_selectedTrkIdx,
		trkCount,
		currentSong,
		arrgMode,
		prev_arrgMode,
		songLength,
		arrangerDispatchers.goToPattern,
	)

	return (
		<ArrangerLayout 
			arrangerDispatchers={arrangerDispatchers}
			activeSongObj={ activeSongObj }
			pattsObj={ pattsObj }
			arrgMode={ arrgMode }
			currentSong={ currentSong }
			isPlay={ isPlay }
			songs={songs}
		/>
	);
};

export default Arranger;