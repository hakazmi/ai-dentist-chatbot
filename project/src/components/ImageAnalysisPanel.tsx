import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { AnalysisResponse } from '../types';
import { DentalAPIService } from '../services/api';

interface ImageAnalysisPanelProps {
  analysisResult: AnalysisResponse;
  onClose: () => void;
}

const apiService = new DentalAPIService();

export function ImageAnalysisPanel({ analysisResult, onClose }: ImageAnalysisPanelProps) {
  const imageUrl = apiService.getImageUrl(analysisResult.output_image_path);
  const { detections } = analysisResult;

  // Add safety checks for detections
  const hasDetections = detections && typeof detections === 'object';
  const detectionCount = hasDetections ? (detections.count || 0) : 0;
  const detectionClasses = hasDetections && detections.classes ? detections.classes : {};
  const detectionDetails = hasDetections && detections.details ? detections.details : [];

  console.log('🔍 Analysis Result:', analysisResult);
  console.log('🔍 Detections:', detections);
  console.log('🔍 Detection Classes:', detectionClasses);

  return (
    <div className="w-96 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
        <h2 className="text-lg font-bold text-gray-900">Analysis Results</h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Analyzed X-ray
          </h3>
          <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={imageUrl}
              alt="Analyzed X-ray"
              className="w-full h-auto"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y1ZjVmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBOb3QgQXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
              }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Detection Summary
          </h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Total Detections: {detectionCount}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {analysisResult.analysis_summary}
                </p>
              </div>
            </div>
          </div>
        </div>

        {Object.keys(detectionClasses).length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Detected Classes
            </h3>
            <div className="space-y-2">
              {Object.entries(detectionClasses).map(([className, count]) => (
                <div
                  key={className}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    {count > 0 ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {className.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {detectionDetails.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Detailed Findings
            </h3>
            <div className="space-y-2">
              {detectionDetails.map((detection, index) => {
                const confidencePercent = detection.confidence * 100;
                const isLowConfidence = confidencePercent < 60;
                const isMediumConfidence = confidencePercent >= 60 && confidencePercent < 80;
                const isHighConfidence = confidencePercent >= 80;
                
                // Determine background and border colors based on confidence
                let bgColor = 'bg-amber-50';
                let borderColor = 'border-amber-200';
                let badgeColor = 'text-amber-700 bg-amber-100';
                let confidenceLabel = '';
                
                if (isLowConfidence) {
                  bgColor = 'bg-gray-50';
                  borderColor = 'border-gray-300';
                  badgeColor = 'text-gray-700 bg-gray-200';
                  confidenceLabel = 'Low Confidence';
                } else if (isMediumConfidence) {
                  bgColor = 'bg-yellow-50';
                  borderColor = 'border-yellow-200';
                  badgeColor = 'text-yellow-700 bg-yellow-100';
                  confidenceLabel = 'Medium Confidence';
                } else if (isHighConfidence) {
                  bgColor = 'bg-red-50';
                  borderColor = 'border-red-200';
                  badgeColor = 'text-red-700 bg-red-100';
                  confidenceLabel = 'High Confidence';
                }
                
                return (
                  <div
                    key={index}
                    className={`p-3 ${bgColor} border ${borderColor} rounded-lg`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {detection.class.replace(/_/g, ' ')}
                      </p>
                      <span className={`text-xs font-semibold ${badgeColor} px-2 py-1 rounded`}>
                        {confidencePercent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-600">
                        {confidenceLabel}
                      </p>
                      {isLowConfidence && (
                        <span className="text-xs text-gray-500 italic">
                          Lower Detection
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 leading-relaxed">
            This analysis is generated by AI and should be reviewed by a qualified dental
            professional. The results are for informational purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}