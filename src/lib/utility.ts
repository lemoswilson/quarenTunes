import { indicators } from "../containers/Track/defaults";
import { triggs } from '../context/ToneObjectsContext';
import * as Tone from 'tone';

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

export function extendObj(entry: any, extension: any): any {
    return {
        ...entry,
        ...extension
    };
};

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

export function scheduleEventStartEnd(triggs: triggs[], start: any, end: any){
  const trkCount = triggs.length;
  for (let i = 0; i < trkCount; i ++){
    triggs[i].instrument.start(start)
    triggs[i].instrument.stop(end)

    const fxCount = triggs[i].effects.length
    for (let j = 0; j < fxCount ; j ++){
      triggs[i].effects[j].start(start)
      triggs[i].effects[j].stop(end)
    }
  }
};


// let time = {
//     '16n': s,
//     '128n': ev.offset ? ev.offset : 0,
// };