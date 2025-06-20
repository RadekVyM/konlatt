export function copyArray<T>(array: Array<T>, length: i32): Array<T> {
    const newArray = new Array<T>(length);

    for (let i = 0; i < Math.min(length, array.length); i++)
        newArray[i] = array[i];

    return newArray;
}

export function copyStaticArray<T>(array: StaticArray<T>, length: i32): StaticArray<T> {
    const newArray = new StaticArray<T>(length);

    for (let i = 0; i < Math.min(length, array.length); i++)
        newArray[i] = array[i];

    return newArray;
}

export function createZeroSequence(length: i32): Array<i32> {
    const array = new Array<i32>(length);

    for (let i = 0; i < length; i++) {
        array[i] = 0;
    }

    return array;
}

export function createSequence(length: i32): Array<i32> {
    const array = new Array<i32>(length);

    for (let i = 0; i < length; i++) {
        array[i] = i;
    }

    return array;
}

export function isSortedSubsetOf(subset: Array<i32>, superset: Array<i32>): boolean {
    let i: i32 = 0;
    let j: i32 = 0;

    while (i < superset.length && j < subset.length) {
        if (superset[i] === subset[j]) {
            i++;
            j++;
        } else if (superset[i] < subset[j]) {
            i++;
        } else {
            return false;
        }
    }

    return j === subset.length;
}

export function sortedIntersect(nums1: Array<i32>, nums2: Array<i32>): Array<i32> {
    const result: Array<i32> = [];
    let i = 0; // Pointer for nums1
    let j = 0; // Pointer for nums2

    while (i < nums1.length && j < nums2.length) {
        if (nums1[i] < nums2[j]) {
            i++;
        } else if (nums1[i] > nums2[j]) {
            j++;
        } else {
            // If elements are equal, add to result
            result.push(nums1[i]);
            i++;
            j++;
        }
    }

    return result;
}