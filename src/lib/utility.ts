import { indicators } from "../containers/Track/defaults";
import { triggs } from '../context/ToneObjectsContext';

export function range(size: number, startAt: number = 0): number[] {
    return [...Array(size).keys()].map(i => i + startAt);
};

export function startEndRange(start: number, end: number): number[] {
    return Array(end - start + 1).fill(null).map((_, idx) => start + idx)
}

export function timeObjFromEvent(step: number, event: any, isEvent: boolean = true): any {
    return {
        '16n': step,
        '128n': isEvent && event.offset ? event.offset : event ? event : 0,
    };
}

export function typeMovement(ind: indicators, e: any): number {
    return e.movementY
};

export function getFinalStep(activePage: number, trackLen: number){
  const pageInit = activePage * 16
  const stepAmount = trackLen - pageInit
  return pageInit + Math.min(16, stepAmount) - 1 
}

export function bisect(sortedList: number[], el: number){
    if(!sortedList.length) return 0;
  
    if(sortedList.length == 1) {
      return el > sortedList[0] ? 1 : 0;
    }
  
    let lbound = 0;
    let rbound = sortedList.length - 1;
    return bisect(lbound, rbound);
  
  // note that this function depends on closure over lbound and rbound
  // to work correctly
    function bisect(lb: number, rb: number): number{
      if(rb - lb == 1){
        if(sortedList[lb] < el && sortedList[rb] >= el){
          return lb + 1;
        }
  
        if(sortedList[lb] == el){
          return lb;
        }
      }
  
      if(sortedList[lb] > el){
        return 0;
      }
  
      if(sortedList[rb] < el){
        return sortedList.length
      }
  
      let midPoint = lb + (Math.floor((rb - lb) / 2));
      let midValue = sortedList[midPoint];
  
      if(el <= midValue){
        rbound = midPoint
      }
  
      else if(el > midValue){
        lbound = midPoint
      }
  
      return bisect(lbound, rbound);
    }
}

export const bbsFromSixteenth = (value: number | string): string => {
	return `0:0:${value}`;
};

export const sixteenthFromBBSOG = (time: string): number => {
	return sixteenthFromBBS(time.split('.')[0])
}

export const sixteenthFromBBS = (time: string): number => {
	let result: number = Number();
	const timeArray: number[] = time.split(':').map(v => parseInt(v));

	timeArray.forEach((v, idx, arr) => {
		if (idx === 0) {
			result = result + v * 16;
		} else if (idx === 1) {
			result = result + v * 4;
		} else {
			result = result + v
		}
	});
	return result
}

export function scheduleStartEnd(
  triggs: triggs[],
  start?: any,
  end?: any,
  callbackInstruments?: (...args: any[]) => void,
  instrumentArgs?: any[],
  copy?: boolean,
  callbackEffects?: (...args: any[]) => void,
  effectsArgs?: any[],
  cancel?: boolean,
) {
    for (let i of startEndRange(0, triggs.length-1)){

      if (cancel)
        triggs[i].instrument.cancel() 
      if (start || start === 0)
        triggs[i].instrument.start(start) 
      if (end === 'now')
        triggs[i].instrument.stop()
      else if (end || end === 0)
        triggs[i].instrument.stop(end)

      // const instArgs = instrumentArgs ? [...instrumentArgs] : null;
      const instArgs = instrumentArgs ? [...instrumentArgs] : [];
      // const baseArg = copy && instArgs ? instArgs : null;
      const baseArg = copy && instArgs ? instArgs : [];
      const fxArgs = effectsArgs ? [...effectsArgs] : baseArg;

      callbackInstruments?.(
        start, 
        triggs[i].instrument, 
        ...instArgs
      );

        for (let j of startEndRange(0, triggs[i].effects.length-1)){
          if (cancel)
            triggs[i].effects[j].cancel() 
          if (start || start === 0)
            triggs[i].effects[j].start(start)
          if (end === 'now')
            triggs[i].effects[j].stop()
          else if (end || end === 0)
            triggs[i].effects[j].stop(end)

          callbackEffects?.(
            start, 
            triggs[i].effects[j], 
            ...fxArgs
          );
        }
    }

}
