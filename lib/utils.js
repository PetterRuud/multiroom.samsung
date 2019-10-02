const encode = value => {
  return encodeURIComponent(value);
};

const matchBetweenTags = (tagName, input) => {
  const re = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`);
  let result = input.match(re);
  if (result && typeof result[1] === 'string') return result[1];
  return null;
};

const s4 = () =>
  Math.floor((1 + Math.random()) * 0x10000)
    .toString()
    .substring(1);

const guid = () => `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;

const getTimestamp = function(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1 <= 9 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours() <= 9 ? `0${date.getHours()}` : date.getHours();
  const minutes = date.getMinutes() <= 9 ? `0${date.getMinutes()}` : date.getMinutes();
  const seconds = date.getSeconds() <= 9 ? `0${date.getSeconds()}` : date.getSeconds();

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

module.exports = {
  guid,
  getTimestamp,
  encode,
  matchBetweenTags,
};
