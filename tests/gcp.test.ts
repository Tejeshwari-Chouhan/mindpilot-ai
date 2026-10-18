import { describe, it, expect } from 'vitest';
import { getGCPConfig } from '../lib/gcp/config';
import { generateVertexGeminiResponse, analyzeCheckInWithVertex } from '../lib/gcp/vertex-gemini';
import { queryEnvironmentalAndSocialDatasets, getBigQueryCohortBenchmark, streamTelemetryToBigQuery } from '../lib/gcp/bigquery';
import { extractFeatureVector, predictResilienceHorizon } from '../lib/gcp/vertex-predict';
import { getEarthEngineEnvironmentalProfile, calculateEnvironmentalRetentionDiscount, EXAM_HUBS_GEO } from '../lib/gcp/earth-engine';
import { uploadToCloudStorage, generateUploadSignedUrl } from '../lib/gcp/storage';
import { analyzeStudyDeskErgonomics, analyzeHandwrittenMockNotes } from '../lib/gcp/vision';
import { publishPubSubEvent, dispatchCrisisAlertEvent, getRecentPubSubEvents } from '../lib/gcp/pubsub';
import { StudentProfile, DailyCheckIn, DailyLogEntry } from '../lib/types';

describe('Google Cloud Platform Integrations for MindPilot AI', () => {
  const mockProfile: StudentProfile = {
    name: 'Bhavesh',
    academic: {
      examType: 'JEE',
      targetScore: '280',
      examDate: '2026-09-15',
      studyHoursPerDay: 11,
    },
    lifestyle: {
      sleepHours: 5.5,
      exerciseHabits: 'Occasional',
      coachingStatus: 'Offline Coaching',
    },
    assessment: {
      primaryStressorSources: ['fear of failure', 'parent expectations', 'physics backlog'],
      anxietyLevelSelfAssessment: 7,
      supportSystemRating: 5,
    },
    createdAt: new Date().toISOString(),
  };

  const mockCheckIn: DailyCheckIn = {
    id: 'test-gcp-1',
    date: '2026-06-15',
    mood: 'anxious',
    energyLevel: 5,
    stressLevel: 8,
    sleepHours: 5.5,
    studyHours: 11.5,
    journalEntry: 'Physics rotation backlog is mounting and mock test marks are low.',
  };

  const mockHistory: DailyLogEntry[] = [
    {
      checkIn: mockCheckIn,
      analysis: {
        emotion: 'Anxious',
        confidence: 35,
        motivation: 50,
        burnoutRisk: 68,
        stressTriggers: ['Physics', 'Mock Test'],
        academicConcerns: ['Rotation Backlog'],
        sleepIssues: true,
        parentPressure: true,
        interventionSuggestions: ['Take break', 'Review core formulas'],
      },
      mentalDNASnapshot: {
        primaryStressors: ['Physics', 'Mock Test'],
        confidencePattern: 'Mock Test Dependent',
        recoveryStyle: 'Action-Oriented',
        motivationType: 'Fear Avoidance',
        burnoutSusceptibility: 'High',
        emotionalResilience: 45,
        preferredInterventionStyle: 'Action Plan',
      },
    },
  ];

  // 1. Config Test
  it('loads valid GCP configuration with regional defaults', () => {
    const config = getGCPConfig();
    expect(config.projectId).toBeDefined();
    expect(config.region).toBe('asia-south1');
    expect(config.vertexAiLocation).toBe('us-central1');
    expect(config.pubsubTopics.telemetry).toContain('telemetry');
    expect(config.pubsubTopics.crisis).toContain('crisis');
  });

  // 2. Gemini on Vertex AI Reasoning Test
  it('generates a reasoning response via Gemini on Vertex AI layer', async () => {
    const res = await generateVertexGeminiResponse('How can I overcome physics rotation mechanics panic?');
    expect(res.text).toBeDefined();
    expect(res.text.length).toBeGreaterThan(10);
    expect(['vertex-ai', 'gemini-direct', 'local-fallback']).toContain(res.source);
  });

  it('performs structured diagnostic journal extraction via Vertex AI layer', async () => {
    const { analysis, engine } = await analyzeCheckInWithVertex(mockCheckIn, mockProfile, mockHistory);
    expect(analysis.burnoutRisk).toBeGreaterThan(50);
    expect(analysis.stressTriggers).toContain('Physics');
    expect(['vertex-ai', 'gemini-direct', 'local']).toContain(engine);
  });

  // 3. BigQuery Analytics Test
  it('queries large environmental and social datasets from BigQuery', async () => {
    const metrics = await queryEnvironmentalAndSocialDatasets('Kota');
    expect(metrics.length).toBeGreaterThan(0);
    const kota = metrics.find((m) => m.hubCity.includes('Kota'));
    expect(kota).toBeDefined();
    expect(kota?.averageAqi).toBeGreaterThan(150);
    expect(kota?.environmentalCorrelation).toBeGreaterThan(0.5);
  });

  it('computes student cohort percentiles from BigQuery telemetry benchmarks', async () => {
    const benchmark = await getBigQueryCohortBenchmark('JEE', 72, 5.0);
    expect(benchmark.cohortSize).toBeGreaterThan(10000);
    expect(benchmark.percentileRank).toBeGreaterThanOrEqual(5);
    expect(benchmark.percentileRank).toBeLessThanOrEqual(99);
    expect(benchmark.recommendedCalibration).toBeDefined();
  });

  it('streams telemetry record into BigQuery buffer', async () => {
    const result = await streamTelemetryToBigQuery(mockCheckIn, mockProfile, { city: 'Kota', aqi: 195 });
    expect(result.success).toBe(true);
    expect(result.rowId).toBe(mockCheckIn.id);
  });

  // 4. Vertex AI Predictive Models Test
  it('extracts normalized feature vector for Vertex AI predictive models', () => {
    const features = extractFeatureVector(mockProfile, mockHistory);
    expect(features.sleepDebtHours).toBeCloseTo(2.0, 1);
    expect(features.studyToSleepRatio).toBeGreaterThan(1.5);
    expect(features.parentPressureActive).toBe(true);
  });

  it('predicts 7-day burnout horizon and simulated marks loss with Vertex AI model', async () => {
    const prediction = await predictResilienceHorizon(mockProfile, mockHistory);
    expect(prediction.predictedBurnoutRisk7d).toBeGreaterThan(50);
    expect(prediction.dailyForecasts).toHaveLength(7);
    expect(prediction.predictedMarksLossSimulation.marksSaved).toBeGreaterThan(0);
    expect(prediction.optimalFocusWindows.peakHours).toBeDefined();
  });

  // 5. Google Earth Engine Test
  it('retrieves satellite environmental profiles for competitive exam hubs from Earth Engine', async () => {
    const kotaProfile = await getEarthEngineEnvironmentalProfile('kota');
    expect(kotaProfile.city).toBe('Kota');
    expect(kotaProfile.metrics.airQualityIndex).toBeGreaterThan(150);
    expect(kotaProfile.metrics.surfaceTemperatureC).toBeGreaterThan(30);
    expect(kotaProfile.cognitiveImpact.predictedFatigueMultiplier).toBeGreaterThan(1.1);

    const delhiProfile = await getEarthEngineEnvironmentalProfile('delhi');
    expect(delhiProfile.metrics.airQualityIndex).toBeGreaterThan(250);
  });

  it('calculates environmental retention discount based on Earth Engine ESI index', () => {
    const highStressDiscount = calculateEnvironmentalRetentionDiscount(80);
    expect(highStressDiscount.discountPct).toBe(15);
    expect(highStressDiscount.explanation).toContain('High Environmental Stress');

    const lowStressDiscount = calculateEnvironmentalRetentionDiscount(40);
    expect(lowStressDiscount.discountPct).toBe(0);
  });

  // 6. Cloud Storage Test
  it('generates secure upload Signed URLs for Cloud Storage', async () => {
    const urlInfo = await generateUploadSignedUrl('voice-journal-1.webm', 'audio/webm', 'audio-journals');
    expect(urlInfo.uploadUrl).toBeDefined();
    expect(urlInfo.destination).toContain('audio-journals');
  });

  it('uploads buffers directly to Cloud Storage vault', async () => {
    const testBuffer = Buffer.from('MindPilot GCP Test Data', 'utf-8');
    const result = await uploadToCloudStorage('test.txt', testBuffer, 'text/plain', 'datasets');
    expect(result.fileUrl).toContain('storage.googleapis.com');
    expect(result.sizeBytes).toBe(testBuffer.length);
  });

  // 7. Vision AI Test
  it('analyzes desk posture and ergonomics using Vision AI', async () => {
    const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = await analyzeStudyDeskErgonomics(dummyImage);
    expect(result.postureStatus).toBeDefined();
    expect(result.ergonomicSuggestions.length).toBeGreaterThan(0);
    expect(result.fatigueScore).toBeGreaterThanOrEqual(0);
  });

  it('performs OCR error classification on handwritten mock notes using Vision AI', async () => {
    const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const result = await analyzeHandwrittenMockNotes(dummyImage);
    expect(result.detectedText).toBeDefined();
    expect(result.errorClassification.calculationMistakes).toBeGreaterThanOrEqual(0);
    expect(result.recommendedReviewStrategy).toBeDefined();
  });

  // 8. Pub/Sub Event-Driven Pipeline Test
  it('dispatches asynchronous events to Google Cloud Pub/Sub topics', async () => {
    const res = await publishPubSubEvent('mindpilot-checkin-telemetry', 'CHECKIN_TELEMETRY', 'NORMAL', {
      student: 'Bhavesh',
      studyHours: 11,
    });
    expect(res.messageId).toBeDefined();
    expect(res.topic).toBe('mindpilot-checkin-telemetry');

    const recent = getRecentPubSubEvents();
    expect(recent.length).toBeGreaterThan(0);
  });

  it('routes crisis alert events with CRITICAL priority on Pub/Sub', async () => {
    const res = await dispatchCrisisAlertEvent({
      studentName: 'Test Student',
      detectedKeywords: ['self-harm'],
      helplineProvided: 'Tele-MANAS 14416',
      timestamp: new Date().toISOString(),
    });
    expect(res.topic).toContain('crisis');
    const recent = getRecentPubSubEvents();
    const crisisEvt = recent.find((e) => e.eventType === 'CRISIS_ESCALATION');
    expect(crisisEvt).toBeDefined();
    expect(crisisEvt?.priority).toBe('CRITICAL');
  });
});
