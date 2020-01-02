import * as tf from '@tensorflow/tfjs';
import * as tfvis from '@tensorflow/tfjs-vis';
import { MnistData } from './MnistData';

class MnistExamples {
  constructor() {
    this.run();
  }

  async run() {
    const data = new MnistData();
    await data.load();
    await this.showExamples(data);
  }

  async showExamples(data: MnistData) {
    const surface = tfvis.visor().surface({
      name: 'Input Data Examples',
      tab: 'Input Data'
    });
    const examples = data.nextTestBatch(20);
    const numExamples = examples.xs.shape[0];

    for (let i = 0; i < numExamples; i++) {
      const imageTensor = tf.tidy(() => {
        return examples.xs
          .slice([i, 0], [1, examples.xs.shape[1]])
          .reshape([28, 28, 1]);
      });
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = 28;
      canvas.style.margin = '4px';
      const tempImageTensor = imageTensor as tf.Tensor2D;
      await tf.browser.toPixels(tempImageTensor, canvas);
      surface.drawArea.appendChild(canvas);
      imageTensor.dispose();
    }
  }
}

export default MnistExamples;
