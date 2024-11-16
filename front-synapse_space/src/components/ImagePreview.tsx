import React, { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

interface ImagePreviewProps {
    imageUrl: string;
    alt: string;
}

export function ImagePreview({ imageUrl, alt }: ImagePreviewProps) {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
    const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
    const rotate = () => setRotation(prev => (prev + 90) % 360);

    return (
        <div className="relative bg-base-200 rounded-lg overflow-hidden">
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button
                    onClick={zoomIn}
                    className="p-2 bg-accent rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    aria-label="Zoom in"
                >
                    <ZoomIn className="w-5 h-5 text-secondary" />
                </button>
                <button
                    onClick={zoomOut}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    aria-label="Zoom out"
                >
                    <ZoomOut className="w-5 h-5 text-secondary" />
                </button>
                <button
                    onClick={rotate}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    aria-label="Rotate image"
                >
                    <RotateCw className="w-5 h-5 text-secondary" />
                </button>
            </div>
            <div className="overflow-auto h-[400px] flex items-center justify-center">
                <img
                    src={imageUrl}
                    alt={alt}
                    className="transition-transform duration-200 ease-in-out"
                    style={{
                        transform: `scale(${scale}) rotate(${rotation}deg)`,
                        maxWidth: '100%',
                        height: 'auto',
                    }}
                />
            </div>
        </div>
    );
}