from huggingface_hub import hf_hub_download
from ultralytics import YOLO
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List


class DentalModelHandler:
    """Handles YOLO model loading and inference for dental X-ray analysis"""
    
    def __init__(self):
        """Initialize and load YOLO model once"""
        self.repo_id = "abdulsamad99/dental-yolo-segmentation"
        self.model = None
        self.names = None
        self.class_colors = {
            0: (144, 238, 144),  # Healthy_Tooth - Light Green
            1: (255, 69, 0),     # Caries - Red-Orange
            2: (255, 165, 0),    # Impacted_Tooth - Orange
            3: (255, 105, 180),  # Broken_Down_Crown_Root - Hot Pink
            4: (255, 0, 0),      # Infection - Red
            5: (220, 20, 60),    # Fractured_Tooth - Crimson
        }
        self._load_model()
    
    def _load_model(self):
        """Load YOLO model from Hugging Face"""
        try:
            print("🔍 Downloading model from Hugging Face...")
            model_path = hf_hub_download(
                repo_id=self.repo_id,
                filename="best.pt",
                repo_type="model"
            )
            
            self.model = YOLO(model_path)
            self.names = self.model.names
            print("✅ YOLO model loaded successfully!")
            print(f"Classes: {self.names}")
        except Exception as e:
            print(f"❌ Error loading model: {str(e)}")
            raise
    
    def predict(self, image_path: str, conf: float = 0.25, iou: float = 0.7):
        """Run inference on image with 25% confidence threshold to capture all detections"""
        if self.model is None:
            raise Exception("Model not loaded")
        
        results = self.model.predict(
            source=image_path,
            conf=conf,  # Now defaults to 0.60 (60%)
            iou=iou,
            device='cpu'
        )
        
        return results[0]
    
    def visualize_result(self, result, save_path: str):
        """Create visualization with masks and bounding boxes"""
        img = result.orig_img.copy()
        
        if result.masks is None:
            print("⚠️ No masks detected in image.")
            cv2.imwrite(save_path, img)
            return
        
        # Draw masks
        overlay = img.copy()
        for mask, cls in zip(result.masks.xy, result.boxes.cls):
            class_id = int(cls)
            color = self.class_colors.get(class_id, (128, 128, 128))
            pts = mask.reshape((-1, 1, 2)).astype(np.int32)
            cv2.fillPoly(overlay, [pts], color)
        
        img = cv2.addWeighted(overlay, 0.25, img, 0.75, 0)
        
        # Draw bounding boxes and labels
        for box, cls in zip(result.boxes.xyxy, result.boxes.cls):
            x1, y1, x2, y2 = map(int, box)
            class_id = int(cls)
            class_name = self.names[class_id]
            color = self.class_colors.get(class_id, (128, 128, 128))
            
            # Draw bounding box
            cv2.rectangle(img, (x1, y1), (x2, y2), color, 1)
            
            # Draw label
            label = class_name.replace('_', ' ')
            font_scale = 0.35
            thickness = 1
            
            (text_w, text_h), _ = cv2.getTextSize(
                label, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness
            )
            label_x = x1 + (x2 - x1 - text_w) // 2
            label_y = max(y1 - 5, text_h + 5)
            
            # Label background
            cv2.rectangle(
                img,
                (label_x - 2, label_y - text_h - 2),
                (label_x + text_w + 2, label_y + 2),
                color,
                -1
            )
            
            # Label text
            cv2.putText(
                img, label, (label_x, label_y),
                cv2.FONT_HERSHEY_SIMPLEX, font_scale,
                (255, 255, 255), thickness, cv2.LINE_AA
            )
        
        # Save result
        Path(save_path).parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(save_path, img)
        print(f"💾 Saved visualization to: {save_path}")
    
    def extract_detections(self, result) -> Dict:
        """Extract detection information from result - FIXED to match frontend interface"""
        detections = {
            "count": 0,          # Changed from "total_detections" to "count"
            "classes": {},       # Changed from "by_class" to "classes"
            "details": []
        }
        
        if result.boxes is None or len(result.boxes) == 0:
            return detections
        
        for box, cls, conf in zip(result.boxes.xyxy, result.boxes.cls, result.boxes.conf):
            class_id = int(cls)
            class_name = self.names[class_id]
            confidence = float(conf)
            
            # Count by class
            if class_name not in detections["classes"]:
                detections["classes"][class_name] = 0
            detections["classes"][class_name] += 1
            
            # Add detail
            detections["details"].append({
                "class": class_name,
                "confidence": round(confidence, 2),
                "bbox": [float(x) for x in box]
            })
            
            detections["count"] += 1  # Changed from "total_detections"
        
        print(f"✅ Extracted {detections['count']} detections")
        print(f"📊 Classes: {detections['classes']}")
        
        return detections
    
    def generate_summary(self, detections: Dict) -> str:
        """Generate human-readable summary of detections"""
        # Updated to use "count" instead of "total_detections"
        total = detections.get("count", 0)
        
        if total == 0:
            return "No dental issues detected in the X-ray."
        
        summary_parts = [
            f"Analysis found {total} dental findings:"
        ]
        
        # Updated to use "classes" instead of "by_class"
        classes = detections.get("classes", {})
        
        for class_name, count in classes.items():
            readable_name = class_name.replace('_', ' ')
            summary_parts.append(f"- {count} {readable_name}(s)")
        
        # Add severity assessment
        if "Infection" in classes or "Caries" in classes:
            summary_parts.append("\n⚠️ Urgent conditions detected that require immediate attention.")
        elif "Fractured_Tooth" in classes:
            summary_parts.append("\n⚠️ Structural issues detected that need dental care.")
        
        return "\n".join(summary_parts)