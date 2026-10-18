'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Cpu, 
  Database, 
  Radio, 
  Globe2, 
  HardDrive, 
  Camera, 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Zap,
  BarChart3,
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HubGeospatialProfile } from '@/lib/gcp/earth-engine';
import { EnvironmentalSocialMetric } from '@/lib/gcp/bigquery';
import { VertexPredictionResult } from '@/lib/gcp/vertex-predict';
import { PubSubEventEnvelope } from '@/lib/gcp/pubsub';
import { useStudentData } from '@/hooks/useStudentData';

export default function CloudIntelligenceHub() {
  const { profile, history } = useStudentData();

  const [activeTab, setActiveTab] = useState<'overview' | 'vertex' | 'earthengine' | 'bigquery' | 'vision' | 'pubsub'>('overview');
  const [selectedCity, setSelectedCity] = useState<string>('kota');
  const [geoData, setGeoData] = useState<HubGeospatialProfile | null>(null);
  const [bigQueryMetrics, setBigQueryMetrics] = useState<EnvironmentalSocialMetric[]>([]);
  const [prediction, setPrediction] = useState<VertexPredictionResult | null>(null);
  const [pubsubEvents, setPubsubEvents] = useState<PubSubEventEnvelope[]>([]);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Vision test state
  const [visionMode, setVisionMode] = useState<'ergonomics' | 'ocr'>('ergonomics');
  const [visionResult, setVisionResult] = useState<any>(null);
  const [visionScanning, setVisionScanning] = useState<boolean>(false);

  // Storage upload test
  const [storageUploading, setStorageUploading] = useState<boolean>(false);
  const [storageResult, setStorageResult] = useState<any>(null);

  useEffect(() => {
    async function loadGCPData() {
      setLoading(true);
      try {
        // 1. Health & Cloud Run probe
        const healthRes = await fetch('/api/health');
        if (healthRes.ok) setHealthStatus(await healthRes.json());

        // 2. Earth Engine
        const geoRes = await fetch(`/api/gcp/environmental?city=${selectedCity}`);
        if (geoRes.ok) {
          const data = await geoRes.json();
          setGeoData(data.hub);
        }

        // 3. BigQuery
        const bqRes = await fetch('/api/gcp/bigquery');
        if (bqRes.ok) {
          const data = await bqRes.json();
          setBigQueryMetrics(data.metrics);
        }

        // 4. Vertex AI Prediction
        if (profile) {
          const predRes = await fetch('/api/gcp/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile, history }),
          });
          if (predRes.ok) {
            const data = await predRes.json();
            setPrediction(data.prediction);
          }
        }

        // 5. Pub/Sub
        const psRes = await fetch('/api/gcp/pubsub');
        if (psRes.ok) {
          const data = await psRes.json();
          setPubsubEvents(data.events);
        }
      } catch (err) {
        console.error('Failed to load GCP data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadGCPData();
  }, [selectedCity, profile, history]);

  // Handle Vision AI Scan demo
  const handleTestVisionAI = async (mode: 'ergonomics' | 'ocr') => {
    setVisionScanning(true);
    setVisionMode(mode);
    try {
      const mockSampleImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const res = await fetch('/api/gcp/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: mockSampleImage,
          mode: mode === 'ocr' ? 'mock-notes-ocr' : 'ergonomics',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setVisionResult(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVisionScanning(false);
    }
  };

  // Handle Cloud Storage direct upload test
  const handleTestStorageUpload = async () => {
    setStorageUploading(true);
    try {
      const res = await fetch('/api/gcp/storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: `telemetry-sample-${Date.now()}.json`,
          base64Data: Buffer.from(JSON.stringify({ timestamp: new Date(), source: 'Client' })).toString('base64'),
          contentType: 'application/json',
          folder: 'datasets',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setStorageResult(data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setStorageUploading(false);
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-300" role="region" aria-label="Google Cloud Intelligence Suite">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-primary/20 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-purple-500/10 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/20 text-primary border border-primary/30 flex items-center gap-1.5">
                <Cloud size={14} className="animate-pulse" />
                Google Cloud Platform Enterprise Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                Cloud Run Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
              Cloud Resilience & Environmental Intelligence
            </h1>
            <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
              Unified cognitive telemetry orchestration spanning <strong>Gemini on Vertex AI</strong>, <strong>BigQuery</strong>, <strong>Vertex AI Predictive Modeling</strong>, <strong>Google Earth Engine</strong>, <strong>Cloud Storage</strong>, <strong>Vision AI</strong>, <strong>Cloud Run</strong>, and <strong>Pub/Sub</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white/5 border border-card-border p-2.5 rounded-2xl backdrop-blur-sm shrink-0">
            <Server size={18} className="text-primary" />
            <div className="text-left text-xs">
              <span className="block text-[10px] text-text-muted font-bold uppercase">Target Host</span>
              <span className="font-extrabold text-foreground">Google Cloud Run (asia-south1)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 bg-white/5 p-1.5 rounded-2xl border border-card-border w-fit max-w-full overflow-x-auto" role="tablist">
        {[
          { id: 'overview' as const, label: 'Cloud Architecture', icon: Cloud },
          { id: 'vertex' as const, label: 'Vertex AI & Gemini', icon: Cpu },
          { id: 'earthengine' as const, label: 'Earth Engine Geospatial', icon: Globe2 },
          { id: 'bigquery' as const, label: 'BigQuery Datasets', icon: Database },
          { id: 'vision' as const, label: 'Vision AI Ergonomics', icon: Camera },
          { id: 'pubsub' as const, label: 'Pub/Sub Event Bus', icon: Radio },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-text-muted hover:text-foreground hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & 8-TECH MATRIX */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Gemini on Vertex AI */}
            <div className="glass-panel p-5 rounded-2xl border border-card-border hover:border-primary/40 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Cpu size={18} /></span>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">Reasoning</span>
              </div>
              <h3 className="font-extrabold text-sm text-foreground">Gemini on Vertex AI</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Powers the Dual-Persona Copilot (Mother + Best Friend) and multi-turn student cognitive extraction with safety filters.
              </p>
            </div>

            {/* 2. BigQuery */}
            <div className="glass-panel p-5 rounded-2xl border border-card-border hover:border-primary/40 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500"><Database size={18} /></span>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-500">Analytics</span>
              </div>
              <h3 className="font-extrabold text-sm text-foreground">BigQuery</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Processes environmental and social cohort datasets (68,750+ student records) to correlate high AQI/heat with study retention drop.
              </p>
            </div>

            {/* 3. Vertex AI Predictive Models */}
            <div className="glass-panel p-5 rounded-2xl border border-card-border hover:border-primary/40 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><TrendingUp size={18} /></span>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">ML Forecast</span>
              </div>
              <h3 className="font-extrabold text-sm text-foreground">Vertex AI Predictive Models</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Forecasts 7-day burnout probability curve and simulates marks saved from silly exam errors through circadian calibration.
              </p>
            </div>

            {/* 4. Google Earth Engine */}
            <div className="glass-panel p-5 rounded-2xl border border-card-border hover:border-primary/40 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-teal-500/10 text-teal-500"><Globe2 size={18} /></span>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-teal-500/10 text-teal-500">Geospatial</span>
              </div>
              <h3 className="font-extrabold text-sm text-foreground">Google Earth Engine</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Analyzes Sentinel-5P (AQI/PM2.5), MODIS (Heat Island), and Sentinel-2 (Green Canopy NDVI) for coaching hubs.
              </p>
            </div>

            {/* 5. Cloud Storage */}
            <div className="glass-panel p-5 rounded-2xl border border-card-border hover:border-primary/40 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-amber-500/10 text-amber-500"><HardDrive size={18} /></span>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">Media Vault</span>
              </div>
              <h3 className="font-extrabold text-sm text-foreground">Cloud Storage (GCS)</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Secure bucket storage and V4 Signed URLs for audio voice journals, vision imagery, and BigQuery dataset exports.
              </p>
            </div>

            {/* 6. Vision AI */}
            <div className="glass-panel p-5 rounded-2xl border border-card-border hover:border-primary/40 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500"><Camera size={18} /></span>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-500">Computer Vision</span>
              </div>
              <h3 className="font-extrabold text-sm text-foreground">Vision AI</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Desk posture & forward-head slump detection, room lighting verification, and OCR analysis of handwritten mock test papers.
              </p>
            </div>

            {/* 7. Cloud Run */}
            <div className="glass-panel p-5 rounded-2xl border border-card-border hover:border-primary/40 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500"><Server size={18} /></span>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500">Serverless</span>
              </div>
              <h3 className="font-extrabold text-sm text-foreground">Cloud Run</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Containerized multi-stage Docker deployment, automated knative scaling (0-10 instances), and fast cold-starts in asia-south1.
              </p>
            </div>

            {/* 8. Pub/Sub */}
            <div className="glass-panel p-5 rounded-2xl border border-card-border hover:border-primary/40 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-orange-500/10 text-orange-500"><Radio size={18} /></span>
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-500">Event Bus</span>
              </div>
              <h3 className="font-extrabold text-sm text-foreground">Google Cloud Pub/Sub</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Asynchronous event streams for check-in telemetry ingestion, environmental heat alarms, and instant crisis escalation webhooks.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VERTEX AI & GEMINI */}
      {activeTab === 'vertex' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Predictive Burnout Horizon */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-card-border">
            <div className="flex items-center justify-between border-b border-card-border/50 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-primary w-5 h-5" />
                <h3 className="text-sm font-extrabold text-foreground">Vertex AI: 7-Day Burnout Horizon Forecast</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                Model: vertex-ai-burnout-forecaster-v1
              </span>
            </div>

            {prediction && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/5 border border-card-border p-3 rounded-2xl">
                    <span className="text-[9px] text-text-muted uppercase font-bold block">Current Risk</span>
                    <span className="text-xl font-black text-foreground">{prediction.predictedBurnoutRisk7d}%</span>
                  </div>
                  <div className="bg-white/5 border border-card-border p-3 rounded-2xl">
                    <span className="text-[9px] text-text-muted uppercase font-bold block">Risk Trend</span>
                    <span className={`text-xl font-black ${prediction.riskTrend === 'Ascending' ? 'text-error' : 'text-success'}`}>
                      {prediction.riskTrend}
                    </span>
                  </div>
                  <div className="bg-white/5 border border-card-border p-3 rounded-2xl">
                    <span className="text-[9px] text-text-muted uppercase font-bold block">Marks Saved</span>
                    <span className="text-xl font-black text-emerald-500">+{prediction.predictedMarksLossSimulation.marksSaved} M</span>
                  </div>
                </div>

                {/* 7-day Trajectory Bar Graph */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-text-muted block">Day-by-Day Predicted Fatigue Trajectory:</span>
                  <div className="space-y-1.5">
                    {prediction.dailyForecasts.map((df) => (
                      <div key={df.dayOffset} className="flex items-center gap-3 text-xs bg-white/5 p-2 rounded-xl">
                        <span className="w-16 font-mono text-[10px] text-text-muted">Day +{df.dayOffset}</span>
                        <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              df.predictedBurnoutProb >= 70 ? 'bg-error' : df.predictedBurnoutProb >= 45 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${df.predictedBurnoutProb}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-black text-[11px]">{df.predictedBurnoutProb}%</span>
                        <span className="text-[9px] text-text-muted hidden sm:inline truncate max-w-[120px]">{df.contributingFactor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 p-3.5 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-primary block">Circadian Cognitive Peak Recommendation:</span>
                  <p className="text-text-muted leading-relaxed">
                    Peak focus hours: <strong>{prediction.optimalFocusWindows.peakHours}</strong>.
                    Avoid high-stakes problem sets during: <strong>{prediction.optimalFocusWindows.cautionHours}</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Gemini on Vertex AI Reasoning */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-card-border">
            <div className="flex items-center justify-between border-b border-card-border/50 pb-3">
              <div className="flex items-center gap-2">
                <Cpu className="text-blue-500 w-5 h-5" />
                <h3 className="text-sm font-extrabold text-foreground">Gemini on Vertex AI Reasoning</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
                gemini-1.5-flash-001
              </span>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-text-muted">
              <p>
                MindPilot integrates <strong>Gemini on Google Cloud Vertex AI</strong> as its primary cognitive and emotional reasoning core:
              </p>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="text-foreground">Dual-Persona Safety Architecture</strong>: Evaluates student emotional states and switches between warm maternal care ("Mom") and relatable peer coaching ("Best Friend").</li>
                <li><strong className="text-foreground">Clinical Diagnostic Guardrails</strong>: Never gives medical diagnoses; strictly enforces safety banners with 24/7 helplines (Tele-MANAS, Vandrevala Foundation) upon crisis keyword detection.</li>
                <li><strong className="text-foreground">Unstructured Extraction</strong>: Transforms messy student voice notes and study diaries into structured JSON indicators (burnout risk, subject dread triggers, confidence indices).</li>
              </ul>

              <div className="bg-white/5 border border-card-border p-4 rounded-2xl space-y-2">
                <span className="font-bold text-foreground block text-xs">Vertex AI Inference Pipeline Status:</span>
                <div className="flex items-center gap-2 text-xs text-emerald-500 font-bold">
                  <CheckCircle2 size={14} /> Active & Grounded on Student Academic Profiles
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EARTH ENGINE GEOSPATIAL */}
      {activeTab === 'earthengine' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-5 border border-card-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-card-border/50 pb-4">
              <div>
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <Globe2 className="text-teal-500 w-5 h-5" />
                  Google Earth Engine: Satellite Environmental Telemetry
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Earth Engine satellite indices (Copernicus Sentinel-5P, MODIS, Sentinel-2) analyzing student coaching hubs.
                </p>
              </div>

              {/* City Selector */}
              <div className="flex gap-1.5 bg-white/5 p-1 rounded-xl border border-card-border">
                {['kota', 'delhi', 'hyderabad', 'bengaluru'].map((cityKey) => (
                  <button
                    key={cityKey}
                    onClick={() => setSelectedCity(cityKey)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg capitalize transition cursor-pointer ${
                      selectedCity === cityKey
                        ? 'bg-teal-500 text-white shadow-sm'
                        : 'text-text-muted hover:text-foreground'
                    }`}
                  >
                    {cityKey}
                  </button>
                ))}
              </div>
            </div>

            {geoData && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Air Quality Index (Sentinel-5P) */}
                  <div className="bg-white/5 border border-card-border p-4 rounded-2xl space-y-1 text-center">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Air Quality (PM2.5)</span>
                    <span className={`text-2xl font-black ${geoData.metrics.airQualityIndex > 200 ? 'text-error' : geoData.metrics.airQualityIndex > 100 ? 'text-amber-500' : 'text-emerald-500'}`}>
                      {geoData.metrics.airQualityIndex} AQI
                    </span>
                    <span className="text-[10px] text-text-muted block">{geoData.metrics.pm25ConcentrationUgM3} µg/m³</span>
                  </div>

                  {/* Surface Temperature (MODIS) */}
                  <div className="bg-white/5 border border-card-border p-4 rounded-2xl space-y-1 text-center">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Surface Heat Island</span>
                    <span className="text-2xl font-black text-foreground">{geoData.metrics.surfaceTemperatureC}°C</span>
                    <span className="text-[10px] text-amber-500 font-bold block">{geoData.metrics.heatAnomalyC > 0 ? `+${geoData.metrics.heatAnomalyC}°C anomaly` : 'Normal'}</span>
                  </div>

                  {/* Green Space Index (Sentinel-2 NDVI) */}
                  <div className="bg-white/5 border border-card-border p-4 rounded-2xl space-y-1 text-center">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Green Canopy (NDVI)</span>
                    <span className="text-2xl font-black text-foreground">{geoData.metrics.vegetationIndexNdvi}</span>
                    <span className="text-[10px] text-text-muted block">Density: {geoData.metrics.urbanDensityScore}/10</span>
                  </div>

                  {/* Environmental Stress Index */}
                  <div className="bg-white/5 border border-card-border p-4 rounded-2xl space-y-1 text-center">
                    <span className="text-[10px] text-text-muted uppercase font-bold block">Environmental Stress Index</span>
                    <span className={`text-2xl font-black ${geoData.environmentalStressIndex > 70 ? 'text-error' : 'text-amber-500'}`}>
                      {geoData.environmentalStressIndex}/100
                    </span>
                    <span className="text-[10px] text-error font-bold block">
                      Fatigue x{geoData.cognitiveImpact.predictedFatigueMultiplier}
                    </span>
                  </div>
                </div>

                {/* Geospatial Recommendations */}
                <div className="bg-teal-500/10 border border-teal-500/20 p-4 rounded-2xl space-y-2">
                  <span className="text-xs font-black text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                    Satellite Environmental Calibration ({geoData.city}, {geoData.state}):
                  </span>
                  <ul className="space-y-1 text-xs text-text-muted list-disc list-inside">
                    {geoData.cognitiveImpact.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: BIGQUERY DATASETS */}
      {activeTab === 'bigquery' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-5 border border-card-border">
            <div className="flex items-center justify-between border-b border-card-border/50 pb-4">
              <div>
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <Database className="text-purple-500 w-5 h-5" />
                  BigQuery Environmental & Social Cohort Analytics
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Large-scale SQL query telemetry analyzing correlation between environmental stressors and study retention.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-500">
                Dataset: mindpilot_analytics.environmental_social_telemetry
              </span>
            </div>

            {/* BigQuery Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-card-border text-[10px] text-text-muted uppercase tracking-wider">
                    <th className="py-2.5 px-3">Exam Prep Hub</th>
                    <th className="py-2.5 px-3">Analyzed Aspirants</th>
                    <th className="py-2.5 px-3">Avg AQI</th>
                    <th className="py-2.5 px-3">Surface Heat</th>
                    <th className="py-2.5 px-3">Avg Sleep</th>
                    <th className="py-2.5 px-3">Burnout Rate</th>
                    <th className="py-2.5 px-3">Social Stress Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/40 font-medium">
                  {bigQueryMetrics.map((row) => (
                    <tr key={row.hubCity} className="hover:bg-white/5 transition">
                      <td className="py-3 px-3 font-bold text-foreground">{row.hubCity}</td>
                      <td className="py-3 px-3 font-mono">{row.sampleSize.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.averageAqi > 200 ? 'bg-error/15 text-error' : 'bg-amber-500/15 text-amber-500'}`}>
                          {row.averageAqi}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">{row.averageHeatIndexCelsius}°C</td>
                      <td className="py-3 px-3 font-mono">{row.averageSleepHours}h</td>
                      <td className="py-3 px-3 font-bold text-foreground">{row.burnoutRatePct}%</td>
                      <td className="py-3 px-3 text-[11px] text-text-muted">{row.primarySocialStressor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: VISION AI & STORAGE */}
      {activeTab === 'vision' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vision AI Ergonomics */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-card-border">
            <div className="flex items-center justify-between border-b border-card-border/50 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="text-rose-500 w-5 h-5" />
                <h3 className="text-sm font-extrabold text-foreground">Vision AI: Desk Ergonomics & Posture</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-500">
                ImageAnnotatorClient
              </span>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Detects physical eye fatigue, desk tilt angles, and slump to prevent tension headaches during 10+ hour study days.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => handleTestVisionAI('ergonomics')}
                disabled={visionScanning}
                className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                {visionScanning ? <RefreshCw className="animate-spin w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />}
                Analyze Desk Ergonomics
              </button>
              <button
                onClick={() => handleTestVisionAI('ocr')}
                disabled={visionScanning}
                className="bg-secondary hover:bg-secondary/90 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                {visionScanning ? <RefreshCw className="animate-spin w-3.5 h-3.5" /> : <BarChart3 className="w-3.5 h-3.5" />}
                OCR Test Paper Analysis
              </button>
            </div>

            {visionResult && (
              <div className="bg-white/5 border border-card-border p-4 rounded-2xl text-xs space-y-2 animate-in fade-in">
                {visionMode === 'ergonomics' ? (
                  <>
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-text-muted">Posture Status:</span>
                      <span className="text-amber-500">{visionResult.postureStatus}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-text-muted">Eye Strain Risk:</span>
                      <span className="text-foreground">{visionResult.eyeStrainRisk}</span>
                    </div>
                    <div className="pt-2 border-t border-card-border/40 space-y-1">
                      <span className="font-bold text-primary block">Corrective Guidance:</span>
                      <ul className="list-disc list-inside text-text-muted text-[11px] space-y-0.5">
                        {visionResult.ergonomicSuggestions.map((s: string, idx: number) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-text-muted">Detected Subject:</span>
                      <span className="text-primary">{visionResult.identifiedSubject}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-text-muted">Calculation Slips:</span>
                      <span className="text-error">{visionResult.errorClassification?.calculationMistakes} slips</span>
                    </div>
                    <p className="text-[11px] text-text-muted mt-2">
                      {visionResult.recommendedReviewStrategy}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cloud Storage Vault */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-card-border">
            <div className="flex items-center justify-between border-b border-card-border/50 pb-3">
              <div className="flex items-center gap-2">
                <HardDrive className="text-amber-500 w-5 h-5" />
                <h3 className="text-sm font-extrabold text-foreground">Cloud Storage (GCS) Vault</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                Bucket: mindpilot-media-vault
              </span>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              Stores student voice notes, visual study snapshots, and generated analytical exports with signed V4 upload URLs.
            </p>

            <button
              onClick={handleTestStorageUpload}
              disabled={storageUploading}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              {storageUploading ? <RefreshCw className="animate-spin w-3.5 h-3.5" /> : <HardDrive className="w-3.5 h-3.5" />}
              Test Secure GCS Upload
            </button>

            {storageResult && (
              <div className="bg-white/5 border border-card-border p-4 rounded-2xl text-xs space-y-1.5 animate-in fade-in">
                <span className="font-bold text-success flex items-center gap-1">
                  <CheckCircle2 size={13} /> Upload Success
                </span>
                <p className="text-[11px] text-text-muted font-mono truncate">
                  URI: {storageResult.fileUrl}
                </p>
                <div className="flex justify-between text-[10px] text-text-muted pt-1">
                  <span>Size: {storageResult.sizeBytes} bytes</span>
                  <span>Bucket: {storageResult.bucket}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: PUB/SUB EVENT BUS */}
      {activeTab === 'pubsub' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-3xl space-y-5 border border-card-border">
            <div className="flex items-center justify-between border-b border-card-border/50 pb-4">
              <div>
                <h3 className="text-base font-black text-foreground flex items-center gap-2">
                  <Radio className="text-orange-500 w-5 h-5 animate-pulse" />
                  Google Cloud Pub/Sub Event Bus Stream
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Live asynchronous event pipeline delivering check-in telemetry, crisis escalations, and environmental alerts.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded bg-orange-500/10 text-orange-500">
                Real-time Dispatch
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {pubsubEvents.map((evt) => (
                <div 
                  key={evt.eventId}
                  className="bg-white/5 border border-card-border p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        evt.priority === 'CRITICAL' ? 'bg-error/20 text-error' : evt.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-500' : 'bg-primary/20 text-primary'
                      }`}>
                        {evt.eventType}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted">{evt.eventId}</span>
                    </div>
                    <p className="font-mono text-[11px] text-foreground">
                      Topic: <span className="text-secondary font-bold">{evt.topic}</span>
                    </p>
                    <p className="text-[10px] text-text-muted">
                      Payload: {JSON.stringify(evt.payload)}
                    </p>
                  </div>

                  <span className="text-[10px] text-text-muted font-mono whitespace-nowrap">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
