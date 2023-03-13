// All vanilla JS function translated from Lodash can be found from:
// https://youmightnotneed.com/lodash/

const get = (obj, path, defValue) => {
    // If path is not defined or it has false value
    if (!path) return undefined;
    // Check if path is string or array. Regex : ensure that we do not have '.' and brackets.
    // Regex explained: https://regexr.com/58j0k
    const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);
    // Find value
    const result = pathArray.reduce(
        (prevObj, key) => prevObj && prevObj[key],
        obj
    );
    // If found value is undefined return default value; otherwise return the value
    return result === undefined ? defValue : result;
};

const set = (obj, path, value) => {
    // Regex explained: https://regexr.com/58j0k
    const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);

    pathArray.reduce((acc, key, i) => {
        if (acc[key] === undefined) acc[key] = {};
        if (i === pathArray.length - 1) acc[key] = value;
        return acc[key];
    }, obj);
};
