import * as tf from '@tensorflow/tfjs';
import SignaturePad from 'signature_pad';

class MnistSipmle {
  private drawElement: HTMLCanvasElement;
  private signaturePad: SignaturePad;
  private model: tf.LayersModel;

  constructor() {
    this.drawElement = document.getElementById(
      'draw-area'
    ) as HTMLCanvasElement;
    this.signaturePad = new SignaturePad(this.drawElement, {
      minWidth: 6,
      maxWidth: 6,
      penColor: 'white',
      backgroundColor: 'black'
    });
    const resetButton = document.getElementById('reset-button');
    resetButton.addEventListener('click', () => this.reset());

    const predictButton = document.getElementById('predict-button');
    predictButton.addEventListener('click', () => this.prediction());

    tf.loadLayersModel('./mnist_model/model.json').then(pretrainedModel => {
      predictButton.classList.remove('is-loading');
      this.model = pretrainedModel;
    });
  }

  getImageData(): ImageData {
    const inputWidth = 28;
    const inputHeight = 28;
    const tmpContext = document.createElement('canvas').getContext('2d');
    tmpContext.drawImage(this.drawElement, 0, 0, inputWidth, inputHeight);

    // conver gray scale
    const imageData = tmpContext.getImageData(0, 0, inputWidth, inputHeight);
    imageData.data.forEach((value, i) => {
      const avg =
        (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
      imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = avg;
    });
    return imageData;
  }

  getAccracyScores(imageData: ImageData) {
    const score = tf.tidy(() => {
      // convert to tensor (shape: [width, height, channels])
      const channels = 1;
      // eslint-disable-next-line no-unused-vars
      let input = tf.browser.fromPixels(imageData, channels);
      // normarized
      input = tf.cast(input, 'float32').div(tf.scalar(255));
      // reshape input format (shape: [batch_size, width, height, channels])
      input = input.expandDims();
      const model = (<tf.Tensor<tf.Rank>>this.model.predict(input)).dataSync();
      return model;
    });
    return score;
  }

  prediction() {
    const imageData = this.getImageData();
    const accuracyScores = this.getAccracyScores(imageData);
    const maxAccuracy = accuracyScores.indexOf(
      Math.max.apply(null, accuracyScores)
    );
    const elements = document.querySelectorAll('.accuracy') as NodeListOf<
      HTMLElement
    >;
    elements.forEach(el => {
      el.parentElement.classList.remove('is-selected');
      const rowIndex = Number(el.dataset['rowIndex']);
      if (maxAccuracy === rowIndex) {
        el.parentElement.classList.add('is-selected');
      }
      el.innerHTML = accuracyScores[rowIndex].toString();
    });
  }

  reset() {
    this.signaturePad.clear();
    const elements = document.querySelectorAll('.accracy') as NodeListOf<
      HTMLElement
    >;
    elements.forEach(el => {
      el.parentElement.classList.remove('is-selected');
      el.innerHTML = '-';
    });
  }
}

export default MnistSipmle;
