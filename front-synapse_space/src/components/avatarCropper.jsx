import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImg";

const AvatarCropper = ({ imageSrc, onCropComplete, cropShape }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    const handleCropComplete = useCallback((_, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleCrop = useCallback(async () => {
        if (imageSrc && croppedAreaPixels) {
            try {
                const croppedImg = await getCroppedImg(imageSrc, croppedAreaPixels);
                onCropComplete(croppedImg);
            } catch (e) {
                console.error(e);
            }
        }
    }, [imageSrc, croppedAreaPixels, onCropComplete]);

    return (
        <div>
            <div className="card bg-base-100 w-96 shadow-xl">
                <div className="card-body">
                    <div className="relative w-full h-96">
                        <Cropper
                            image={imageSrc}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            cropShape={cropShape}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={handleCropComplete}
                        />
                    </div>

                    <form method="dialog">
                        <button onClick={handleCrop} className="mt-4 p-2 bg-blue-500 text-white rounded">
                            Crop Image
                        </button>
                    </form>
                </div>
            </div>
            {/* <div style={{ position: "relative", height: "400px", width: "100%" }}>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                />
            </div>
             */}
        </div>
    );
};

export default AvatarCropper;
