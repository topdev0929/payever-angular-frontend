import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener, Input, Inject } from '@angular/core';
import * as THREE from 'three';
import { PMREMGenerator } from 'three';
import { OrbitControls, DRACOLoader, GLTFLoader, RoomEnvironment } from 'three-stdlib';


import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { ThreeJsModelInterface } from '../interfaces';

import { THREEJS_DEFAULTS } from './defaults.const';

@Component({
  selector: 'pe-three-js-renderer',
  template:`<div #rendererContainer></div>`,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }

    div {
      width: 100%;
      height: 100%;
    }
  `],
})
export class ThreejsRendererComponent implements AfterViewInit, OnDestroy {
  @Input() model!: ThreeJsModelInterface;

  @ViewChild('rendererContainer', { static: true }) rendererContainer!: ElementRef;
  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;
  private pmremGenerator!: PMREMGenerator;
  private frameId!: number;
  public isLoading?: boolean;
  loadingProgress?: number;


  private defaultConfig = THREEJS_DEFAULTS;

  ngAfterViewInit(): void {
    this.initThree();
    this.initControls();
    this.loadModel();
    this.animate();
    this.updateRendererSize();
  }

  ngOnDestroy(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
  }

  private updateRendererSize(): void {
    const maxWidth = this.model.width || this.defaultConfig.defaultWidth;
    const maxHeight = this.model.height || this.defaultConfig.defaultHeight;

    const aspectRatio = maxWidth / maxHeight;

    let newWidth, newHeight;

    if (window.innerWidth / window.innerHeight > aspectRatio) {
      newHeight = Math.min(window.innerHeight, maxHeight);
      newWidth = newHeight * aspectRatio;
    } else {
      newWidth = Math.min(window.innerWidth, maxWidth);
      newHeight = newWidth / aspectRatio;
    }

    this.renderer.setSize(newWidth, newHeight);
    this.camera.aspect = aspectRatio;
    this.controls.update();
    this.camera.updateProjectionMatrix();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: Event): void {
    this.updateRendererSize();
  }

  private initThree(): void {
    this.scene = new THREE.Scene();

    const aspectRatio =
      this.model.width && this.model.height
        ? this.model.width / this.model.height
        : this.defaultConfig.defaultWidth / this.defaultConfig.defaultHeight;

    this.camera = new THREE.PerspectiveCamera(
      this.model.cameraFOV || this.defaultConfig.defaultCameraFOV,
      aspectRatio,
      this.model.cameraNearPlane || this.defaultConfig.defaultCameraNearPlane,
      this.model.cameraFarPlane || this.defaultConfig.defaultCameraFarPlane,
    );
    this.camera.position.copy(this.model.initialCameraPosition || this.defaultConfig.defaultCameraPosition);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.toneMapping = this.model.tuneMapping || this.defaultConfig.defaultTuneMapping;
    this.renderer.toneMappingExposure = this.model.toneMappingExposure || this.defaultConfig.defaultTuneMappingExposure;

    this.pmremGenerator = new PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();
    const envMap = this.pmremGenerator.fromScene(RoomEnvironment()).texture;
    this.scene.environment = envMap;

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.maxWidth = '100%';
    this.renderer.domElement.style.maxHeight = '100%';

    const ambientLight = new THREE.AmbientLight(
      this.model.ambientLightColor || this.defaultConfig.defaultAmbientLightColor,
      this.model.ambientLightIntensity || this.defaultConfig.defaultAmbientLightIntensity,
    );
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      this.model.directionalLightColor || this.defaultConfig.defaultDirectionalLightColor,
      this.model.directionalLightIntensity || this.defaultConfig.defaultDirectionalLightIntensity
    );
    directionalLight.position.copy(
      this.model.directionalLightPosition || this.defaultConfig.defaultDirectionalLightPosition,
    );
    this.scene.add(directionalLight);

    this.renderer.outputEncoding = THREE.sRGBEncoding;
  }

  private initControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = this.model.controlsDamping ?? this.defaultConfig.defaultControlsDamping;
    this.controls.dampingFactor = this.model.controlsDampingFactor ?? this.defaultConfig.defaultControlsDampingFactor;
    this.controls.minPolarAngle = this.model.minPolarAngle ?? this.defaultConfig.defaultMinPolarAngle;
    this.controls.maxPolarAngle = this.model.maxPolarAngle ?? this.defaultConfig.defaultMaxPolarAngle;
    this.controls.zoomSpeed = this.model.zoomSpeed ?? this.defaultConfig.defaultZoomSpeed;
    this.controls.enableZoom = this.model.enableZoom ?? this.defaultConfig.defaultEnableZoom;
    this.controls.minAzimuthAngle = this.model.minPolarAngle ?? this.defaultConfig.defaultMinAzimuthAngle;
    this.controls.maxAzimuthAngle = this.model.maxPolarAngle ?? this.defaultConfig.defaultMaxAzimuthAngle;
  }

  private loadModel(): void {
    this.isLoading = true;
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(`${this.env.custom.cdn}/draco/`);

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.load(
      this.model.url,
      (gltf) => {
        this.scene.add(gltf.scene);
        const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
        const center = boundingBox.getCenter(new THREE.Vector3());
        const size = boundingBox.getSize(new THREE.Vector3());

        this.camera.lookAt(center);

        const distance = size.z > 1 ? boundingBox.getSize(new THREE.Vector3()).length() : 2;
        const cameraDistance = distance * this.defaultConfig.defaultCameraDistanceRatio;
        this.camera.position.set(center.x, center.y, center.z + cameraDistance);
        this.controls.target.copy(center);

        this.updateRendererSize();
      },
      (progress) => {
        this.loadingProgress = progress.loaded / progress.total * 100;
      },
      (error) => {
        console.error('Error loading GLTF:', error);
      },
    );
  }

  private animate(): void {
    this.frameId = requestAnimationFrame(() => this.animate());
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }
}
