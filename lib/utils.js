const encode = value => {
  return encodeURIComponent(value);
};

const matchBetweenTags = (tagName, input) => {
  const re = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`);
  let result = input.match(re);
  if (result && typeof result[1] === 'string') return result[1];
  return null;
};

const getResult = input => {
  const re = new RegExp(`<response result="ok">`);
  let result = input.match(re);
  if (result && typeof result[1] === 'string') return true;
  return false;
};

const convertDniToMac = dni => {
  let mac = `${dni.substring(0, 2)}:${dni.substring(2, 4)}:${dni.substring(4, 6)}:${dni.substring(6, 8)}:${dni.substring(8, 10)}:${dni.substring(10, 12)}`;
  mac = mac.toLowerCase();
  return mac;
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
  getResult,
};
