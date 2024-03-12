class TimeIntervalSet {

    // this is a sorted list of time stamps
    // each even indexed element is the start of an interval
    // each odd indexed element is the end of an interval
    intervals: number[] = [];

    constructor(intervals: number[]|undefined = undefined) {
        this.intervals = (intervals) ? intervals : [];
        this.validate()
    }

    validate() {
        for (let i = 1; i < this.intervals.length; i++) {
            if (this.intervals[i-1] > this.intervals[i]) {
                throw new Error("Invalid interval set")
            }
        }
    }

    contains(time: number): boolean {
        for (let i = 0; i < this.intervals.length; i += 2) {
            if (this.intervals[i] <= time && time <= this.intervals[i + 1]) {
                return true;
            }
        }
        return false;
    }

    union(set: TimeIntervalSet): TimeIntervalSet {
        let result = new TimeIntervalSet();

        let i = 0;
        let j = 0;
        while (i < this.intervals.length && j < set.intervals.length) {
            const min = Math.min(this.intervals[i], set.intervals[j]);
            
            if (i % 2 == 0 && j % 2 == 0) {
                result.intervals.push(min);
            }

            if (this.intervals[i] < set.intervals[j]) {
                i++;
            } else {
                j++;
            }

            if (i % 2 == 0 && j % 2 == 0) {
                result.intervals.push(min);
            }
        }

        result.intervals.push(...this.intervals.slice(i));
        result.intervals.push(...set.intervals.slice(j));
        
        return result;
    }

    difference(set: TimeIntervalSet): TimeIntervalSet {
        let result = new TimeIntervalSet();

        let i = 0;
        let j = 0;
        while (i < this.intervals.length && j < set.intervals.length) {
            if (this.intervals[i] < set.intervals[j]) {
                if (j % 2 == 0) { // if outside of the set interval
                    result.intervals.push(this.intervals[i]);
                }
                i++;
            } else if (this.intervals[i] > set.intervals[j]) {
                if (i % 2 == 1) { // if inside a this interval then add all boudaries from the set interval
                    result.intervals.push(
                        set.intervals[j] + (result.intervals.length % 2 == 0 ? 1 : -1),
                    );
                }
                j++;
            } else {
                if (i % 2 != j % 2 ) {
                    result.intervals.push(
                        set.intervals[j] + (result.intervals.length % 2 == 0 ? 1 : -1),
                    );
                }
                i++;
                j++;
            }
        }

        result.intervals.push(...this.intervals.slice(i));
        
        return result;

    }
}

const UnionTestCases = [
    [[1,2], [2,3], [1,3]],
    [[1,10], [1,2,3,4,5,6,7,8,15,16], [1,10,15,16]],
    [[2,4], [3,6], [2,6]],
    [[2,4], [1,3], [1,4]],
    [[2,4], [6,8], [2,4,6,8]],
]

function listEquals(a: number[], b: number[]): boolean {
    if (a.length != b.length) {
        return false;
    }
    for (let i = 0; i < a.length; i++) {
        if (a[i] != b[i]) {
            console.log(a[i], b[i])
            return false;
        }
    }
    return true;
}

function unionTest() {
    for (const t of UnionTestCases) {
        const t1 = new TimeIntervalSet(t[0])
        const t2 = new TimeIntervalSet(t[1])

        const result = t1.union(t2)

        if (!listEquals(result.intervals, t[2])) {
            console.error(`Union test failed for ${t[0]} and ${t[1]}. Expected ${t[2]} but got ${result.intervals}`)
        }
    }
}

const DifferenceTestCases = [
    [[2,3], [1,2], [3,3]],
    [[1,4], [2,3], [1,1,4,4]],
    [[1,4], [3,5], [1,2]],
    [[1,5], [0,3], [4,5]],
    [[1,5], [6,7], [1,5]],
    [[1,5], [0,7], []],
    [[1,2], [2,3], [1,1]],
]

function differenceTest() {
    for (const t of DifferenceTestCases) {
        const t1 = new TimeIntervalSet(t[0])
        const t2 = new TimeIntervalSet(t[1])

        const result = t1.difference(t2)

        if (!listEquals(result.intervals, t[2])) {
            console.error(`Difference test failed for ${t[0]} and ${t[1]}. Expected ${t[2]} but got ${result.intervals}`)
        }
    }
}

differenceTest()
unionTest()