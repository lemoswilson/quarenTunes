function next(time) {
    const bars = parseInt(time.split(':')[0],10),
                beats = parseInt(time.split(':')[1],10),
                sixteenths = parseInt(time.split(':')[2],10);
    if (sixteenths == 3 && beats == 3) {
        return `${bars + 1}:${0}:${0}`;
    } else if (sixteenths < 3 && beats < 3) {
        return `${bars}:${beats}:${sixteenths+1}`;
    } else if (sixteenths == 3 && beats != 3) {
        return `${bars}:${beats + 1}:${0}`;
    }
}