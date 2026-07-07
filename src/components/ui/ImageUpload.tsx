"use client";
import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { Upload, Link as LinkIcon, Crop, X, ZoomIn, ZoomOut, RotateCw, Check, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspectRatio?: number;
  className?: string;
}

// Helper to create a cropped image from canvas
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL("image/jpeg", 0.85);
}

export function ImageUpload({
  value,
  onChange,
  label = "Image",
  aspectRatio = 16 / 10,
  className = "",
}: ImageUploadProps) {
  const [mode, setMode] = useState<"idle" | "url" | "crop">("idle");
  const [rawImage, setRawImage] = useState<string>("");
  const [urlInput, setUrlInput] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      setRawImage(reader.result as string);
      setMode("crop");
      setZoom(1);
      setRotation(0);
      setCrop({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    setRawImage(urlInput.trim());
    setMode("crop");
    setZoom(1);
    setRotation(0);
    setCrop({ x: 0, y: 0 });
  };

  const handleUrlDirect = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput("");
    setMode("idle");
  };

  const handleCropSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      setIsUploading(true);
      const croppedDataUrl = await getCroppedImg(rawImage, croppedAreaPixels);
      
      // Convert Data URL to Blob
      const res = await fetch(croppedDataUrl);
      const blob = await res.blob();
      
      // Generate unique filename
      const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
      
      // Upload to Supabase Storage bucket 'images'
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filename, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      onChange(publicUrl);
      setMode("idle");
      setRawImage("");
      toast.success("Image uploaded successfully");
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast.error(err.message || "Failed to upload image to storage");
      // Fallback: don't save anything if upload fails
    } finally {
      setIsUploading(false);
    }
  };

  const handleCropCancel = () => {
    setMode("idle");
    setRawImage("");
  };

  // Crop overlay
  if (mode === "crop" && rawImage) {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium text-[#C7BFB2]">{label}</label>
        <div className="rounded-xl border border-[#D4A24C]/30 bg-[#141210] overflow-hidden">
          {/* Crop area */}
          <div className="relative w-full h-64 bg-black">
            <Cropper
              image={rawImage}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { borderRadius: "0.5rem" },
              }}
            />
          </div>

          {/* Controls */}
          <div className="p-3 space-y-3 border-t border-[#D4A24C]/10">
            {/* Zoom */}
            <div className="flex items-center gap-3">
              <ZoomOut size={14} className="text-[#C7BFB2]" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-[#D4A24C] h-1"
              />
              <ZoomIn size={14} className="text-[#C7BFB2]" />
            </div>

            {/* Rotation */}
            <div className="flex items-center gap-3">
              <RotateCw size={14} className="text-[#C7BFB2]" />
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="flex-1 accent-[#D4A24C] h-1"
              />
              <span className="text-[10px] text-[#C7BFB2] w-10 text-right">{rotation}°</span>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCropCancel}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-[#C7BFB2] bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-1"
              >
                <X size={14} /> Cancel
              </button>
              <button
                type="button"
                onClick={handleCropSave}
                disabled={isUploading}
                className="flex-1 py-2 rounded-lg text-xs font-medium text-[#1A1410] bg-[#D4A24C] hover:bg-[#c8963f] transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} 
                {isUploading ? "Uploading..." : "Apply & Upload"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // URL input mode
  if (mode === "url") {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium text-[#C7BFB2]">{label}</label>
        <div className="rounded-xl border border-[#D4A24C]/30 bg-[#141210] p-4 space-y-3">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL (https://...)"
            className="w-full rounded-lg border border-[#D4A24C]/15 bg-black/40 p-3 text-sm text-[#F7F3EC] outline-none focus:border-[#D4A24C]/40"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setMode("idle"); setUrlInput(""); }}
              className="flex-1 py-2 rounded-lg text-xs font-medium text-[#C7BFB2] bg-white/5 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUrlDirect}
              className="flex-1 py-2 rounded-lg text-xs font-medium text-[#F7F3EC] bg-white/10 hover:bg-white/15 transition-colors"
            >
              Use Directly
            </button>
            <button
              type="button"
              onClick={handleUrlSubmit}
              className="flex-1 py-2 rounded-lg text-xs font-medium text-[#1A1410] bg-[#D4A24C] hover:bg-[#c8963f] transition-colors flex items-center justify-center gap-1"
            >
              <Crop size={14} /> Crop & Adjust
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: idle mode
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-[#C7BFB2]">{label}</label>

      {/* Preview current image */}
      {value && (
        <div className="relative group rounded-lg overflow-hidden border border-[#D4A24C]/15 bg-black/20">
          <img
            src={value}
            alt="Preview"
            className="w-full h-36 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setRawImage(value);
                setMode("crop");
                setZoom(1);
                setRotation(0);
                setCrop({ x: 0, y: 0 });
              }}
              className="p-2 rounded-lg bg-[#D4A24C]/20 text-[#D4A24C] hover:bg-[#D4A24C]/40 transition-colors"
              title="Re-crop"
            >
              <Crop size={16} />
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-colors"
              title="Remove"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Upload area */}
      <div
        className={`relative rounded-xl border-2 border-dashed transition-colors p-4 text-center cursor-pointer ${
          isDragging
            ? "border-[#D4A24C] bg-[#D4A24C]/10"
            : "border-[#D4A24C]/20 bg-[#141210] hover:border-[#D4A24C]/40"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
            e.target.value = "";
          }}
        />
        <Upload size={20} className="mx-auto text-[#D4A24C]/60 mb-2" />
        <p className="text-xs text-[#C7BFB2]/80">
          <span className="text-[#D4A24C] font-medium">Click to upload</span> or drag & drop
        </p>
        <p className="text-[10px] text-[#C7BFB2]/40 mt-1">PNG, JPG, WEBP up to 5MB</p>
      </div>

      {/* Or use URL */}
      <button
        type="button"
        onClick={() => { setMode("url"); setUrlInput(value || ""); }}
        className="w-full py-2 rounded-lg text-xs font-medium text-[#C7BFB2] bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
      >
        <LinkIcon size={12} /> Or paste image URL
      </button>
    </div>
  );
}
