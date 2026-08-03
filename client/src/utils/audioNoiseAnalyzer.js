/**
 * AudioNoiseAnalyzer
 * Enterprise Web Audio API utility for adaptive noise calibration & speech frequency isolation.
 */
export class AudioNoiseAnalyzer {
  constructor(audioContext, analyserNode) {
    this.audioCtx = audioContext;
    this.analyser = analyserNode;

    // Ambient noise floor calibration state
    this.ambientNoiseFloor = 10; // Default initial baseline estimate (0-255 scale)
    this.calibrationSamples = [];
    this.isCalibrating = true;
    this.maxCalibrationFrames = 25; // ~2.5 seconds at 100ms interval

    // Speech band bin indices (will be computed dynamically from sampleRate)
    this.sampleRate = audioContext?.sampleRate || 48000;
    this.fftSize = analyserNode?.fftSize || 512;
    this.binBandwidth = this.sampleRate / this.fftSize;

    // Speech frequency range: 300 Hz to 3400 Hz
    this.speechStartBin = Math.max(1, Math.floor(300 / this.binBandwidth));
    this.speechEndBin = Math.min(
      Math.floor(this.fftSize / 2) - 1,
      Math.ceil(3400 / this.binBandwidth)
    );
  }

  /**
   * Ensure AudioContext is active (handles browser autoplay policy suspended state)
   */
  async ensureActive() {
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      try {
        await this.audioCtx.resume();
      } catch (err) {
        console.warn("AudioContext resume failed:", err);
      }
    }
  }

  /**
   * Analyze current audio frame
   * Returns calibrated levels, noise burst flag, continuous speech flag, and audio metrics.
   */
  analyze() {
    this.ensureActive();

    if (!this.analyser) {
      return {
        overallLevel: 0,
        speechBandLevel: 0,
        ambientFloor: this.ambientNoiseFloor,
        isNoiseBurst: false,
        isSpeech: false,
        isCalibrating: this.isCalibrating,
      };
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(freqData);

    // 1. Overall Spectrum RMS Energy (0-255 scale)
    let totalSumSq = 0;
    for (let i = 0; i < bufferLength; i++) {
      totalSumSq += freqData[i] * freqData[i];
    }
    const overallRMS = Math.sqrt(totalSumSq / bufferLength);

    // 2. Speech Band Energy (300 Hz - 3400 Hz)
    let speechSumSq = 0;
    let speechBinCount = 0;
    for (let i = this.speechStartBin; i <= this.speechEndBin; i++) {
      speechSumSq += freqData[i] * freqData[i];
      speechBinCount++;
    }
    const speechBandRMS = speechBinCount > 0 ? Math.sqrt(speechSumSq / speechBinCount) : 0;

    // 3. Adaptive Ambient Baseline Calibration
    if (this.isCalibrating) {
      this.calibrationSamples.push(overallRMS);
      if (this.calibrationSamples.length >= this.maxCalibrationFrames) {
        // Compute 40th percentile of samples as the quiet ambient noise floor
        const sorted = [...this.calibrationSamples].sort((a, b) => a - b);
        const p40Index = Math.floor(sorted.length * 0.4);
        this.ambientNoiseFloor = Math.max(5, sorted[p40Index]);
        this.isCalibrating = false;
      } else {
        // Temporary baseline while calibrating
        const avg = this.calibrationSamples.reduce((a, b) => a + b, 0) / this.calibrationSamples.length;
        this.ambientNoiseFloor = Math.max(5, avg);
      }
    } else {
      // Slow adaptation of noise floor (rolling baseline update for slow ambient changes)
      if (overallRMS < this.ambientNoiseFloor * 1.5) {
        this.ambientNoiseFloor = this.ambientNoiseFloor * 0.98 + overallRMS * 0.02;
      }
    }

    // 4. Calibrated Signal Energy above ambient floor
    const signalAboveFloor = Math.max(0, overallRMS - this.ambientNoiseFloor);
    const speechAboveFloor = Math.max(0, speechBandRMS - this.ambientNoiseFloor);

    // 5. Detection Logic
    // Noise Burst: Sudden transient energy spike (> 40 units above ambient floor OR > 3.5x noise floor)
    const isNoiseBurst = overallRMS > 80 && (signalAboveFloor > 40 || overallRMS > this.ambientNoiseFloor * 3.5);

    // Human Speech: Sustained speech band energy (> 15 units above ambient floor AND speech band holds majority energy)
    const isSpeech = speechAboveFloor > 18 && speechBandRMS > overallRMS * 0.75;

    return {
      overallLevel: Math.round(overallRMS),
      speechBandLevel: Math.round(speechBandRMS),
      signalAboveFloor: Math.round(signalAboveFloor),
      ambientFloor: Math.round(this.ambientNoiseFloor),
      isNoiseBurst,
      isSpeech,
      isCalibrating: this.isCalibrating,
    };
  }

  /**
   * Reset calibration baseline if microphone or environment changes
   */
  recalibrate() {
    this.isCalibrating = true;
    this.calibrationSamples = [];
  }
}
