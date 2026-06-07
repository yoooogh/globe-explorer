import { COUNTRY_FLY_HEIGHT, CITY_FLY_HEIGHT } from '../../utils/constants';

export function flyToCountry(viewer: any, Cesium: any, lat: number, lon: number) {
  if (!viewer) return;

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, COUNTRY_FLY_HEIGHT),
    orientation: {
      heading: 0,
      pitch: Cesium.Math.toRadians(-60),
      roll: 0,
    },
    duration: 2.0,
    easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
  });
}

export function flyToCity(viewer: any, Cesium: any, lat: number, lon: number) {
  if (!viewer) return;

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, CITY_FLY_HEIGHT),
    orientation: {
      heading: 0,
      pitch: Cesium.Math.toRadians(-45),
      roll: 0,
    },
    duration: 1.5,
    easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
  });
}

export function flyToCoordinates(
  viewer: any,
  Cesium: any,
  lat: number,
  lon: number,
  height: number
) {
  if (!viewer) return;

  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, height),
    orientation: {
      heading: 0,
      pitch: Cesium.Math.toRadians(-45),
      roll: 0,
    },
    duration: 1.5,
    easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
  });
}
