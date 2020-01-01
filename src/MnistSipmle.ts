import * as tf from '@tensorflow/tfjs';
import SignaturePad from 'signature_pad';

class MnistSipmle {
  private drawElement: HTMLCanvasElement;
  private signaturePad: SignaturePad;
  private model: tf.LayersModel;

  constructor() {
    document.head.innerHTML +=
      '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.6.2/css/bulma.min.css">';
    document.body.innerHTML = this.initHTML();
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

  private getImageData(): ImageData {
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

  private getAccracyScores(imageData: ImageData): tf.backend_util.TypedArray {
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

  initHTML() {
    return `
    <div class="container">
      <h1 class="title">MNIST recognition with TensorFlow.js</h1>
      <h2 class="subtitle">Using Keras pre-trained model (CNN)</h2>
      <div class="columns is-centered">
        <div class="column is-narrow">
          <canvas id="draw-area" width="280" height="280" style="border: 2px solid;"></canvas>
          <div class="field is-grouped">
            <p class="control">
              <a id="predict-button" class="button is-link is-loading">
                Prediction
              </a>
            </p>
            <p class="control">
              <a id="reset-button" class="button">
                Reset
              </a>
            </p>
          </div>
        </div>
        <div class="column is-3">
          <table class="table">
            <thead>
              <tr>
                <th>Number</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>0</th>
                <td class="accuracy" data-row-index="0">-</td>
              </tr>
              <tr>
                <th>1</th>
                <td class="accuracy" data-row-index="1">-</td>
              </tr>
              <tr>
                <th>2</th>
                <td class="accuracy" data-row-index="2">-</td>
              </tr>
              <tr>
                <th>3</th>
                <td class="accuracy" data-row-index="3">-</td>
              </tr>
              <tr>
                <th>4</th>
                <td class="accuracy" data-row-index="4">-</td>
              </tr>
              <tr>
                <th>5</th>
                <td class="accuracy" data-row-index="5">-</td>
              </tr>
              <tr>
                <th>6</th>
                <td class="accuracy" data-row-index="6">-</td>
              </tr>
              <tr>
                <th>7</th>
                <td class="accuracy" data-row-index="7">-</td>
              </tr>
              <tr>
                <th>8</th>
                <td class="accuracy" data-row-index="8">-</td>
              </tr>
              <tr>
                <th>9</th>
                <td class="accuracy" data-row-index="9">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>`;
  }
}

export default MnistSipmle;
