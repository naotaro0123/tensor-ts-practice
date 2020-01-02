import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';

interface CleanedData {
  mpg: number;
  horsepower: number;
}

class Simple {
  constructor() {
    this.run();
  }

  async getData() {
    const carsDataReq = await fetch(
      'https://storage.googleapis.com/tfjs-tutorials/carsData.json'
    );
    const carsData = await carsDataReq.json();
    const cleaned: CleanedData[] = carsData
      .map(car => ({
        mpg: car.Miles_per_Gallon,
        horsepower: car.Horsepower
      }))
      .filter(car => car.mpg != null && car.horsepower != null);
    return cleaned;
  }

  createModel() {
    const model = tf.sequential();
    // 単発の非表示レイヤー
    model.add(tf.layers.dense({ inputShape: [1], units: 1, useBias: true }));
    // 出力レイヤー
    model.add(tf.layers.dense({ units: 1, useBias: true }));
    return model;
  }

  convertToTensor(data: CleanedData[]) {
    return tf.tidy(() => {
      tf.util.shuffle(data);
      // convert Tensor
      const inputs = data.map(d => d.horsepower);
      const labels = data.map(d => d.mpg);
      const inputTensor = tf.tensor2d(inputs, [inputs.length, 1]);
      const labelTensor = tf.tensor2d(labels, [labels.length, 1]);

      // normalize range 0 - 1
      const inputMax = inputTensor.max();
      const inputMin = inputTensor.min();
      const labelMax = labelTensor.max();
      const labelMin = labelTensor.min();

      const normalizeInputs = inputTensor
        .sub(inputMin)
        .div(inputMax.sub(inputMin));
      const normalizeLabels = labelTensor
        .sub(labelMin)
        .div(labelMax.sub(labelMin));

      return {
        inputs: normalizeInputs,
        labels: normalizeLabels,
        inputMax,
        inputMin,
        labelMax,
        labelMin
      };
    });
  }

  async trainModel(model: tf.Sequential, inputs: tf.Tensor, labels: tf.Tensor) {
    model.compile({
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
      metrics: ['mse']
    });
    const batchSize = 32;
    const epochs = 50;
    return await model.fit(inputs, labels, {
      batchSize,
      epochs,
      shuffle: true,
      callbacks: tfvis.show.fitCallbacks(
        { name: 'Training Performance' },
        ['loss', 'mse'],
        {
          height: 200,
          callbacks: ['onEpochEnd']
        }
      )
    });
  }

  testModel(model: tf.Sequential, inputData: CleanedData[], normalizationData) {
    const { inputMax, inputMin, labelMin, labelMax } = normalizationData;
    const [xs, preds] = tf.tidy(() => {
      const xs = tf.linspace(0, 1, 100);
      const preds = model.predict(xs.reshape([100, 1]));
      const unNormXs = xs.mul(inputMax.sub(inputMin)).add(inputMin);
      if (Array.isArray(preds)) {
        return;
      }
      const unNormPreds = preds.mul(labelMax.sub(labelMin)).add(labelMin);
      return [unNormXs.dataSync(), unNormPreds.dataSync()];
    });

    const predictedPoints = Array.from(xs).map((val, i) => {
      return { x: val, y: preds[i] };
    });

    const originalPoints = inputData.map(d => ({
      x: d.horsepower,
      y: d.mpg
    }));

    tfvis.render.scatterplot(
      { name: 'Model Predictions vs Original Data' },
      {
        values: [originalPoints, predictedPoints],
        series: ['original', 'predicted']
      },
      {
        xLabel: 'Horesepower',
        yLabel: 'MPG',
        height: 300
      }
    );
  }

  async run() {
    const data = await this.getData();
    const values: tfvis.Point2D[] = data.map(d => ({
      x: d.horsepower,
      y: d.mpg
    }));
    await tfvis.render.scatterplot(
      { name: 'Horsepower v MPG' },
      { values },
      {
        xLabel: 'Horsepower',
        yLabel: 'MPG',
        height: 300
      }
    );

    const model = this.createModel();
    await tfvis.show.modelSummary({ name: 'Model Summary' }, model);

    const tensorData = this.convertToTensor(data);
    const { inputs, labels } = tensorData;
    await this.trainModel(model, inputs, labels);

    await this.testModel(model, data, tensorData);
  }
}

export default Simple;
