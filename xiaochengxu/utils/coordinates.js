const earthRadius = 6378245;
const eccentricity = 0.006693421622965943;

export function toGcj02(coordinates) {
  const [latitude, longitude] = coordinates;
  if (longitude < 72.004 || longitude > 137.8347 || latitude < 0.8293 || latitude > 55.8271) {
    return { latitude, longitude };
  }
  const longitudeOffset = longitude - 105;
  const latitudeOffset = latitude - 35;
  let latitudeDelta =
    -100 +
    2 * longitudeOffset +
    3 * latitudeOffset +
    0.2 * latitudeOffset * latitudeOffset +
    0.1 * longitudeOffset * latitudeOffset +
    0.2 * Math.sqrt(Math.abs(longitudeOffset));
  latitudeDelta +=
    ((20 * Math.sin(6 * longitudeOffset * Math.PI) + 20 * Math.sin(2 * longitudeOffset * Math.PI)) * 2) / 3;
  latitudeDelta += ((20 * Math.sin(latitudeOffset * Math.PI) + 40 * Math.sin((latitudeOffset / 3) * Math.PI)) * 2) / 3;
  latitudeDelta +=
    ((160 * Math.sin((latitudeOffset / 12) * Math.PI) + 320 * Math.sin((latitudeOffset * Math.PI) / 30)) * 2) / 3;
  let longitudeDelta =
    300 +
    longitudeOffset +
    2 * latitudeOffset +
    0.1 * longitudeOffset * longitudeOffset +
    0.1 * longitudeOffset * latitudeOffset +
    0.1 * Math.sqrt(Math.abs(longitudeOffset));
  longitudeDelta +=
    ((20 * Math.sin(6 * longitudeOffset * Math.PI) + 20 * Math.sin(2 * longitudeOffset * Math.PI)) * 2) / 3;
  longitudeDelta +=
    ((20 * Math.sin(longitudeOffset * Math.PI) + 40 * Math.sin((longitudeOffset / 3) * Math.PI)) * 2) / 3;
  longitudeDelta +=
    ((150 * Math.sin((longitudeOffset / 12) * Math.PI) + 300 * Math.sin((longitudeOffset / 30) * Math.PI)) * 2) / 3;
  const radians = (latitude / 180) * Math.PI;
  const magic = 1 - eccentricity * Math.sin(radians) * Math.sin(radians);
  const rootMagic = Math.sqrt(magic);
  latitudeDelta = (latitudeDelta * 180) / (((earthRadius * (1 - eccentricity)) / (magic * rootMagic)) * Math.PI);
  longitudeDelta = (longitudeDelta * 180) / ((earthRadius / rootMagic) * Math.cos(radians) * Math.PI);
  return { latitude: latitude + latitudeDelta, longitude: longitude + longitudeDelta };
}

export function getMapData(day) {
  const locatedStops = day.stops.filter((stop) => stop.coordinates && !stop.approximate);
  const uniqueStops = locatedStops.filter(
    (stop, index) =>
      locatedStops.findIndex(
        (candidate) =>
          candidate.coordinates[0] === stop.coordinates[0] && candidate.coordinates[1] === stop.coordinates[1],
      ) === index,
  );
  const markers = uniqueStops.map((stop, index) => ({
    ...toGcj02(stop.coordinates),
    id: index,
    title: stop.name,
    iconPath: '/static/travel/map-pin.png',
    width: 24,
    height: 32,
    label: { content: `${index + 1}`, color: '#ffffff', bgColor: '#426a58', borderRadius: 12, padding: 5 },
    callout: {
      content: `${stop.time} ${stop.name}`,
      display: 'BYCLICK',
      color: '#26332f',
      fontSize: 12,
      borderRadius: 8,
      padding: 10,
    },
  }));
  const points = locatedStops.map((stop) => toGcj02(stop.coordinates));
  return {
    markers,
    mapPoints: points,
    mapLatitude: points.length ? points[0].latitude : 38.9,
    mapLongitude: points.length ? points[0].longitude : 121.6,
    polyline: points.length > 1 ? [{ points, color: '#426a5899', width: 3, dottedLine: true }] : [],
  };
}
