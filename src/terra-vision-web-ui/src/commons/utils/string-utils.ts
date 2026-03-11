/* <<<<<<<<<<<< schemas >>>>>>>>>>>> */
export type StringShorteningRule = {
    maxScreenWidth: number;
    startStringLength: number;
    endStringLength: number;
};



/* <<<<<<<<<<<< functions >>>>>>>>>>>> */
function getStartingAndEndingIndexesForString(
    elementWidth: number,
    rules: StringShorteningRule[]
) {
    return (
        rules.find(rule => elementWidth <= rule.maxScreenWidth) ??
        rules[rules.length - 1]
    );
}

function shortenString(str: string, startLength: number = 6, endLength: number = 9): string {
    if (str.length <= startLength + endLength) {
        return str; // no need to truncate
    }

    const start: string = str.substring(0, startLength);
    const end: string = str.substring(str.length - endLength);
    return `${start}...${end}`;
}

export function getShortenedString(
    str: string,
    elementWidth: number,
    rules: StringShorteningRule[]
): string {
    const { startStringLength, endStringLength } = getStartingAndEndingIndexesForString(elementWidth, rules)
    return shortenString(str, startStringLength, endStringLength);
}