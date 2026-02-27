const express = require('express');
const router = express.Router();
const Calculation = require('../models/Calculation');

// POST /api/calculate
router.post('/calculate', async (req, res) => {
  try {
    console.log("--- START CALCULATION ---");
    const params = req.body;
    console.log("Received params:", params);
    
    // Validate FFT size is a power of 2 starting from 4
    if (params.fftSize < 4 || (params.fftSize & (params.fftSize - 1)) !== 0) {
        return res.status(400).json({ error: 'FFT Size must be a power of 2 starting from 4.' });
    }

    // Validate Subcarrier Spacing is smaller than Sampling Rate
    if (params.subcarrierSpacing >= params.samplingRate) {
        return res.status(400).json({ error: 'Subcarrier Spacing must be smaller than Sampling Rate.' });
    }
    
    // Derived Parameters Calculations
    const cpSizeSamples = params.fftSize / 4; // CP = 1/4 of FFT
    const dcSubcarriers = 1;
    
    // Total used subcarriers = FFT Size - DC - Nulls. 
    // We don't know nulls yet. But we know total used subcarriers scales with FFT size.
    // In the baseline problem, FFT=256, Data=120, Pilot=40, DC=1. 120+40+1=161 used.
    // Let's assume the used subcarriers ratio from the problem scales with FFT size.
    const totalUsedSubcarriers = Math.floor(params.fftSize * (161/256));
    const dataPlusPilot = totalUsedSubcarriers - dcSubcarriers;
    
    // Parse the Data:Pilot ratio (e.g. "3:1")
    const ratioParts = params.dataPilotRatio ? params.dataPilotRatio.split(':') : ['3', '1'];
    const dataParts = parseInt(ratioParts[0]);
    const pilotParts = parseInt(ratioParts[1]);
    const totalParts = dataParts + pilotParts;
    
    // Calculate subcarriers based on the user's ratio
    const pilotSubcarriers = Math.floor(dataPlusPilot * (pilotParts / totalParts));
    const dataSubcarriers = dataPlusPilot - pilotSubcarriers;
    const nullSubcarriers = params.fftSize - dataSubcarriers - pilotSubcarriers - dcSubcarriers;

    let bitsPerSymbol = 2; // Default QPSK
    if (params.modulation === 'BPSK') bitsPerSymbol = 1;
    if (params.modulation === '16QAM') bitsPerSymbol = 4;
    if (params.modulation === '64QAM') bitsPerSymbol = 6;
    if (params.modulation === '256QAM') bitsPerSymbol = 8;
    
    // Subframe duration is fixed at 1ms in LTE/5G.
    const subframeDurationMs = 1;
    const subframeLengthSamples = (params.samplingRate * subframeDurationMs) / 1000;

    // 1. OFDM Symbol Timing
    const totalSymbolLength = params.fftSize + cpSizeSamples; 
    const symbolDurationUs = (totalSymbolLength / params.samplingRate) * 1e6; 

    // 2. Subframe Structure
    const totalSymbolsPerSubframe = subframeLengthSamples / totalSymbolLength; 
    const dataSymbols = totalSymbolsPerSubframe - params.silenceSymbols;

    // 3. Resource Elements Calculation
    const dataResPerSubframe = dataSubcarriers * dataSymbols;
    const totalBitsPerSubframe = dataResPerSubframe * bitsPerSymbol; 

    // 4. Data Rate Calculation
    const dataRateBps = totalBitsPerSubframe / (subframeDurationMs / 1000); 
    const dataRateMbps = dataRateBps / 1e6; 

    // 5. Throughput After FEC
    const macThroughputMbps = dataRateMbps * params.fecRate; 

    // 6. Occupied Bandwidth
    const occupiedBandwidthHz = (dataSubcarriers + pilotSubcarriers + dcSubcarriers) * params.subcarrierSpacing;
    const occupiedBandwidthMHz = occupiedBandwidthHz / 1e6;

    const computedParams = {
        ...params,
        cpSizeSamples,
        dataSubcarriers,
        pilotSubcarriers,
        dcSubcarriers,
        nullSubcarriers,
        bitsPerSymbol,
        subframeLengthSamples,
        dataSymbols
    };
    console.log("Computed params:", computedParams);

    const results = {
      totalSymbolLength,
      symbolDurationUs,
      totalSymbolsPerSubframe,
      dataResPerSubframe,
      totalBitsPerSubframe,
      subframeDurationMs,
      dataRateMbps,
      macThroughputMbps,
      occupiedBandwidthMHz,
      // Pass these derived params to frontend for display
      derivedParams: {
          cpSizeSamples,
          dataSubcarriers,
          pilotSubcarriers,
          dcSubcarriers,
          nullSubcarriers,
          bitsPerSymbol,
          subframeLengthSamples,
          dataSymbols
      }
    };

    const calculation = new Calculation({
      parameters: computedParams,
      results: results
    });

    const savedCalculation = await calculation.save();
    console.log("Successfully saved to DB");
    
    res.status(201).json(savedCalculation);

  } catch (error) {
    console.error('Calculation error details:', error);
    if (error.errors) {
        console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    res.status(500).json({ error: 'Failed to calculate and save results.', details: error.message });
  }
});

// GET /api/calculate/history
router.get('/history', async (req, res) => {
  try {
    const history = await Calculation.find().sort({ createdAt: -1 });
    res.json(history);
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ error: 'Failed to fetch calculation history.' });
  }
});

// DELETE /api/calculate/history
router.delete('/history', async (req, res) => {
    try {
        await Calculation.deleteMany({});
        res.json({ message: "History cleared successfully" });
    } catch (error) {
        console.error('Clear history error:', error);
        res.status(500).json({ error: 'Failed to clear calculation history.' });
    }
});

module.exports = router;
