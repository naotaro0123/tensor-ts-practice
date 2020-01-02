import * as handTrack from 'handtrackjs';

export default class HandTrackJs {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private video: HTMLVideoElement;
  private model: any;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '600px';
    this.canvas.style.height = '400px';
    this.canvas.style.display = 'inline';
    document.body.appendChild(this.canvas);
    this.context = this.canvas.getContext('2d');

    this.video = document.createElement('video');
    this.video.style.display = 'inline';
    this.video.style.width = '400px';
    this.video.style.height = '400px';
    document.body.appendChild(this.video);

    const options = {
      flipHorizontal: true, // 左右反転するかどうか
      maxNumBoxes: 3, // 一度に検出する手の数
      iouThreshold: 0.5,
      scoreThreshold: 0.7
    };

    handTrack.load(options).then(l_model => {
      this.model = l_model;
      handTrack.startVideo(this.video).then(status => {
        if (status) {
          this.runDetection();
        } else {
          console.error('error');
        }
      });
    });
  }

  runDetection() {
    this.model.detect(this.video).then(predictions => {
      this.model.renderPredictions(
        predictions,
        this.canvas,
        this.context,
        this.video
      );
      requestAnimationFrame(() => this.runDetection());
    });
  }
}
