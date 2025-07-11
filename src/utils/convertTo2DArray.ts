const convertTo2DArray = (array: any[], columns: number): any[][] => {
    const result: any[][] = [];
    for (let i = 0; i < array.length; i += columns) {
        result.push(array.slice(i, i + columns));
    }
    return result;
}

export default convertTo2DArray;