export interface ThreeJsModelInterface {
  url: string;
  width?: number;
  height?: number;
  initialCameraPosition?: THREE.Vector3;
  ambientLightIntensity?: number;
  ambientLightColor?: number;
  directionalLightIntensity?: number;
  directionalLightColor?: number;
  directionalLightPosition?: THREE.Vector3;
  cameraFOV?: number;
  cameraNearPlane?: number;
  cameraFarPlane?: number;
  controlDampingFactor?: number;
  controlMinPolarAngle?: number;
  controlMaxPolarAngle?: number;
  controlZoomSpeed?: number;

  // Properties for OrbitControls
  controlsDamping?: boolean;
  controlsDampingFactor?: number;
  minPolarAngle?: number;
  maxPolarAngle?: number;
  zoomSpeed?: number;

  enableZoom?: boolean;
}
