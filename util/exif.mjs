import { run } from './run.mjs';

export const exif = async (f) =>
  (await run('exiv2', '-PExgnycv', f))
    .split('\n')
    .filter((s) => s.length > 0)
    .reduce((info, s) => {
      const { cat, prop, format, len, value } = s.match(
        /(?<addr>[^ ]+) +(?<cat>[^ ]+) +(?<prop>[^ ]+) +(?<format>[^ ]+) +(?<len>[0-9]+) +(?<value>.+)/,
      ).groups;
      if (info[cat] === undefined) {
        info[cat] = {};
      }
      let v = value;
      switch (format) {
        case 'Rational':
        case 'SRational':
          v = value
            .split(' ')
            .map((v) => {
              const [a, b] = v.split('/');
              return parseInt(a) / parseInt(b);
            })
            .map((n) => (isNaN(n) ? 0 : n));
          break;
        case 'Short':
          v = parseInt(value, 10);
          break;
        case 'Long':
          v = parseFloat(value);
          break;
      }
      info[cat][prop] = v;
      return info;
    }, {});

export const geo = (exif) => {
  if (exif?.GPSInfo?.GPSLatitude === undefined) return;
  return {
    lat: exif.GPSInfo.GPSLatitude[0],
    lng: exif.GPSInfo.GPSLongitude[0],
  };
};
