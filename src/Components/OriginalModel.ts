import * as tf from '@tensorflow/tfjs';

class OriginalModel {
  private model: tf.GraphModel;

  constructor() {
    document.body.innerHTML += this.initHtml();

    const predictButton = document.getElementById('predict');
    predictButton.addEventListener('click', () => this.prediction());
    tf.loadGraphModel('../models/web_model_debu/model.json').then(
      pretrainedModel => {
        this.model = pretrainedModel;
      }
    );
  }

  prediction() {
    const heightText = document.getElementById('height');
    const weightText = document.getElementById('weight');
    const resultText = document.getElementById('result');

    const inputList = [
      Number(heightText.innerHTML),
      Number(weightText.innerHTML)
    ];
    // eslint-disable-next-line no-unused-vars
    let norm = 0;

    for (let i = 0; i < inputList.length; i++) {
      norm += inputList[i] * inputList[i];
    }
    norm = Math.sqrt(norm);

    for (let i = 0; i < inputList.length; i++) {
      inputList[i] = inputList[i] / norm;
    }

    let x = tf.tensor([inputList]);
    let rate = tf.tensor(1);

    const temp = (<tf.Tensor<tf.Rank>>(
      this.model.predict({ x: x, rate: rate })
    )).dataSync();

    // 正確な判定ができておらず、全て0に
    // console.log(temp, temp.toString());
    switch (temp.toString()) {
      case '0':
        resultText.innerHTML = 'やせ';
        break;
      case '1':
        resultText.innerHTML = 'ふつう';
        break;
      case '2':
        resultText.innerHTML = '肥満1度';
        break;
      case '3':
        resultText.innerHTML = '肥満2度';
        break;
      case '4':
        resultText.innerHTML = '肥満3度';
        break;
      case '5':
        resultText.innerHTML = '肥満4度';
        break;
      default:
        break;
    }
  }

  initHtml() {
    return `
    <div>
      <p>身長(cm)</p><input id="height">
      <p>体重(kg)</p><input id="weight">
      <button id="predict"/>推定</button>
      <p id="result"></p>
    </div>
    `;
  }
}

export default OriginalModel;
