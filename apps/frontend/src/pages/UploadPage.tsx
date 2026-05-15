import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadCsv } from "../api/emailApi";

function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
  }

  async function handleContinue() {
    if (!selectedFile) return;

    try {
      setUploading(true);

      await uploadCsv(selectedFile);

      navigate("/inbox");
    } catch (error) {
      console.error(error);

      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 w-full max-w-2xl shadow-2xl">
        <h1 className="text-5xl font-bold mb-4 text-blue-400">
          Upload Emails CSV
        </h1>

        <p className="text-zinc-400 mb-8">
          Upload an Enron email dataset CSV to begin AI orchestration
          processing.
        </p>

        <label className="border-2 border-dashed border-zinc-700 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition">
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />

          <p className="text-xl font-semibold mb-2">Click to upload CSV</p>

          <p className="text-zinc-500 text-sm">Supported format: .csv</p>
        </label>

        {selectedFile && (
          <div className="mt-6 bg-zinc-800 rounded-xl p-4 border border-zinc-700">
            <p className="text-sm text-zinc-400 mb-1">Selected File</p>

            <p className="font-semibold">{selectedFile.name}</p>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!selectedFile}
          className="mt-8 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed py-4 rounded-2xl font-bold text-lg transition"
        >
          {uploading ? "Uploading..." : "Continue To Inbox"}
        </button>
      </div>
    </div>
  );
}

export default UploadPage;
