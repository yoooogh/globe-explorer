import { DEFAULT_CAMERA_HEIGHT } from '../../utils/constants';

export function createViewer(container: HTMLDivElement, CesiumModule: any) {
  const Cesium = CesiumModule;

  Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN;

  // Chinese vector map (lighter than satellite, looks clean)
  const cnBaseProvider = new Cesium.UrlTemplateImageryProvider({
    url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
    subdomains: ['1', '2', '3', '4'],
    maximumLevel: 16,
    credit: new Cesium.Credit('高德地图', undefined, false),
  });

  const viewer = new Cesium.Viewer(container, {
    baseLayer: new Cesium.ImageryLayer(cnBaseProvider, { show: true }),
    terrain: Cesium.Terrain.fromWorldTerrain(),

    animation: false,
    timeline: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    vrButton: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    infoBox: false,
    selectionIndicator: false,

    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
    targetFrameRate: 60,

    sceneMode: Cesium.SceneMode.SCENE3D,
    shadows: false,
    skyAtmosphere: false,
  });

  // ─── Globe appearance ───
  const globe = viewer.scene.globe;
  globe.enableLighting = true;
  globe.showGroundAtmosphere = true;
  globe.depthTestAgainstTerrain = true;
  globe.maximumScreenSpaceError = 2;
  globe.tileCacheSize = 150;
  globe.baseColor = Cesium.Color.fromCssColorString('#0a1628');

  // Dark background
  viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#050d18');

  // FXAA (lighter than MSAA)
  viewer.scene.postProcessStages.fxaa.enabled = true;

  // Resolution
  viewer.resolutionScale = typeof window !== 'undefined' && window.devicePixelRatio > 1
    ? Math.min(window.devicePixelRatio, 1.5)
    : 1.0;

  // ─── Smooth camera ───
  viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.90;
  viewer.scene.screenSpaceCameraController.inertiaZoom = 0.85;
  viewer.scene.screenSpaceCameraController.inertiaSpin = 0.88;

  // ─── Initial position ───
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(104, 25, DEFAULT_CAMERA_HEIGHT),
    orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
  });

  return viewer;
}
