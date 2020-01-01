import * as THREE from 'three';
import * as CANNON from 'cannon';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import * as CannonDebugRenderer from 'cannon/tools/threejs/CannonDebugRenderer.js';
// const CannonDebugRenderer = require('../node_modules/cannon/tools/threejs/CannonDebugRenderer.js');

class Game {
  private isDebugMode: boolean;
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private world: CANNON.World;
  private fixedTimeStep: number;
  private damping: number;
  // private debugRenderer: any;

  constructor() {
    this.init();
    this.isDebugMode = true;
    if (this.isDebugMode) {
      this.debugMode();
    }
    this.initPhysics();
    this.animation();
  }

  init() {
    this.scene = new THREE.Scene();
    const gameScreenWidth = window.innerWidth;
    const gameScreenHeight = window.innerHeight;
    const aspectRatio = gameScreenWidth / gameScreenHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
    this.camera.lookAt(this.scene.position);
    this.camera.position.z = 50;
    this.camera.position.y = 20;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(gameScreenWidth, gameScreenHeight);
    const gameController = document.getElementById('game');
    gameController.appendChild(this.renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 20, 10);
    const ambient = new THREE.AmbientLight(0x707070);
    this.scene.add(light);
    this.scene.add(ambient);

    const wallGeometry = new THREE.BoxGeometry(24, 40, 1);
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xffff66 });
    const wallMesh = new THREE.Mesh(wallGeometry, wallMaterial);
    wallMesh.position.set(0, 20, -1);
    this.scene.add(wallMesh);
  }

  debugMode() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    const axes = new THREE.AxesHelper(1000);
    this.scene.add(axes);
  }

  initPhysics() {
    this.world = new CANNON.World();
    this.fixedTimeStep = 1.0 / 60.0;
    this.damping = 0.01;

    this.world.broadphase = new CANNON.NaiveBroadphase();
    this.world.gravity.set(0, -10, 0);

    if (this.isDebugMode) {
      // this.debugRenderer = new CannonDebugRenderer(this.scene, this.world);
    }

    const groundMaterial = new CANNON.Material('ground');
    const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    const groundShape = new CANNON.Plane();
    groundBody.addShape(groundShape);
    this.world.addBody(groundBody);

    const sphereMaterial = new CANNON.Material('ball');
    const sphereBody = new CANNON.Body({
      mass: 10,
      material: sphereMaterial
    });
    const sphere = new CANNON.Sphere(1);
    sphereBody.addShape(sphere);
    sphereBody.position.set(0, 40, 0.5);
    sphereBody.linearDamping = this.damping;
    this.world.addBody(sphereBody);

    const seesawMaterial = new CANNON.Material('seesa');
    const seesawBody = new CANNON.Body({ mass: 10, material: seesawMaterial });
    seesawBody.position.set(0, 1.5, 0);

    const seesawBar = new CANNON.Box(new CANNON.Vec3(8, 0.5, 5));
    seesawBody.addShape(seesawBar, new CANNON.Vec3(0, 2, 0));
    const seesawWallF = new CANNON.Box(new CANNON.Vec3(8, 1, 0.5));
    seesawBody.addShape(seesawWallF, new CANNON.Vec3(0, 2.5, 5));
    const seesawWallB = new CANNON.Box(new CANNON.Vec3(8, 1, 0.5));
    seesawBody.addShape(seesawWallB, new CANNON.Vec3(0, 2.5, -5));
    const fulcrumCylinder = new CANNON.Cylinder(1.5, 1.5, 10, 100);
    seesawBody.addShape(fulcrumCylinder);
    this.world.addBody(seesawBody);

    const playerMaterial = new CANNON.Material('player');
    const playerBody = new CANNON.Body({ mass: 10, material: playerMaterial });
    const playerCylinder = new CANNON.Cylinder(2, 2, 8, 100);
    playerBody.addShape(playerCylinder);
    playerBody.position.set(0, 6, 0);
    playerBody.linearDamping = this.damping;
    this.world.addBody(playerBody);
  }

  animation() {
    requestAnimationFrame(() => {
      this.animation();
    });
    this.world.step(this.fixedTimeStep);
    // if (this.isDebugMode) {
    //   this.debugRenderer.update();
    // }
    this.renderer.render(this.scene, this.camera);
  }
}

export default Game;
