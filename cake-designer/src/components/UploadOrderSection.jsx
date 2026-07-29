import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCake } from "../context/CakeContext";

const ACCEPTED = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

export default function UploadOrderSection() {
  const { dispatch } = useCake();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file) {
    setError("");
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Please upload a PNG, JPG, JPEG, or WebP image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  }

  function handleProceed() {
    if (!preview) return;
    dispatch({ type: "SET_REFERENCE_IMAGE", payload: preview });
    navigate("/order");
  }

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-8 pt-16 sm:pt-20 pb-4">
      <div className="text-center mb-6">
        <h2 className="font-display tracked-xl text-xl sm:text-2xl mb-2">Already Have a Design?</h2>
        <p className="text-sm text-ink-soft">
          Skip the decorator entirely — upload a reference picture of the cake you want and go straight to checkout.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`border ${dragOver ? "border-ink" : "border-line"} p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 bg-bone transition-colors`}
      >
        <div className="w-full sm:w-40 h-40 shrink-0 bg-white border border-line flex items-center justify-center overflow-hidden">
          {preview ? (
            <img src={preview} alt="Uploaded reference" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-ink-soft text-center px-3">No image selected</span>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-3 w-full">
          <input
            ref={inputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-6 py-3 bg-ink text-white tracked text-xs hover:bg-black transition-colors"
            >
              {preview ? "Choose a different image" : "Upload Reference Image"}
            </button>
            <button
              type="button"
              onClick={handleProceed}
              disabled={!preview}
              className="px-6 py-3 bg-white text-ink tracked text-xs border border-line hover:border-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Proceed to Checkout
            </button>
          </div>
          {error && <p className="text-xs text-ink">{error}</p>}
          <p className="text-[11px] text-ink-soft">Accepted formats: PNG, JPG, JPEG, WebP.</p>
        </div>
      </div>
    </section>
  );
}
