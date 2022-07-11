

/**
 * returns a random element from an array or object
 * @param  {Array|Object} obj
 * @return {object}
 */
module.exports = function(obj) {

  if (Array.isArray(obj)) {

    return obj[Math.floor(Math.random() * obj.length)];

  } else if (obj instanceof Object) {

    return obj[randElement(Object.keys[obj])];

  }

  return obj;
};
