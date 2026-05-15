import { useEffect, useState } from "react";

import { fetchEmails, processEmails, executeTools } from "../api/emailApi";

type Email = {
  id: string;
  from: string;
  subject: string;
  body: string;
  processingStatus: string;
  processingError?: string | null;
};

function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);

  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const [loading, setLoading] = useState(true);

  const [processingEmails, setProcessingEmails] = useState(false);

  const [executingTools, setExecutingTools] = useState(false);

  async function handleProcessEmails() {
    try {
      setProcessingEmails(true);

      await processEmails();

      const updatedEmails = await fetchEmails();

      setEmails(updatedEmails.data);
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingEmails(false);
    }
  }

  async function handleExecuteTools() {
    try {
      setExecutingTools(true);

      await executeTools();

      const updatedEmails = await fetchEmails();

      setEmails(updatedEmails.data);
    } catch (error) {
      console.error(error);
    } finally {
      setExecutingTools(false);
    }
  }

  useEffect(() => {
    async function loadEmails() {
      try {
        const result = await fetchEmails();

        setEmails(result.data);
      } catch (error) {
        console.error("Failed loading emails", error);
      } finally {
        setLoading(false);
      }
    }

    loadEmails();
  }, []);

  if (loading) {
    return <h1>Loading emails...</h1>;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl font-bold text-blue-400">
            AI Email Triage Dashboard
          </h1>

          <div className="flex gap-4">
            <button
              onClick={handleProcessEmails}
              disabled={processingEmails}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed px-5 py-3 rounded-xl font-semibold transition"
            >
              {processingEmails ? "Processing..." : "Process Emails"}
            </button>

            <button
              onClick={handleExecuteTools}
              disabled={executingTools}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900 disabled:cursor-not-allowed px-5 py-3 rounded-xl font-semibold transition"
            >
              {executingTools ? "Executing..." : "Execute Tools"}
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
          <table className="w-full">
            <thead className="bg-zinc-800 text-zinc-300">
              <tr>
                <th className="text-left px-6 py-4">From</th>

                <th className="text-left px-6 py-4">Subject</th>

                <th className="text-left px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {emails.map((email) => (
                <tr
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className="border-t border-zinc-800 hover:bg-zinc-800/40 transition cursor-pointer"
                >
                  <td className="px-6 py-4 text-zinc-300">{email.from}</td>

                  <td className="px-6 py-4">{email.subject}</td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold
                    ${
                      email.processingStatus === "COMPLETED"
                        ? "bg-green-500/20 text-green-400"
                        : ""
                    }
                    ${
                      email.processingStatus === "FAILED"
                        ? "bg-red-500/20 text-red-400"
                        : ""
                    }
                    ${
                      email.processingStatus === "PENDING"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : ""
                    }
                    ${
                      email.processingStatus === "PROCESSING"
                        ? "bg-blue-500/20 text-blue-400"
                        : ""
                    }
                  `}
                    >
                      {email.processingStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEmail && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 overflow-y-auto z-50">
          <div className="bg-zinc-900 p-8 rounded-2xl max-w-3xl w-full border border-zinc-700 shadow-2xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setSelectedEmail(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white text-3xl"
            >
              ×
            </button>

            <h2 className="text-3xl font-bold mb-8">Email Details</h2>

            <div className="space-y-6">
              <div>
                <p className="text-zinc-400 mb-2">From</p>

                <p className="text-xl font-semibold">{selectedEmail.from}</p>
              </div>

              <div>
                <p className="text-zinc-400 mb-2">Subject</p>

                <p className="text-xl font-semibold">{selectedEmail.subject}</p>
              </div>

              <div>
                <p className="text-zinc-400 mb-2">Status</p>

                <p>{selectedEmail.processingStatus}</p>
              </div>

              <div>
                <p className="text-zinc-400 mb-4">Email Body</p>

                <div className="bg-zinc-800 p-6 rounded-2xl leading-8 text-zinc-300 whitespace-pre-wrap">
                  {selectedEmail.body}
                </div>
              </div>

              {selectedEmail.processingError && (
                <div>
                  <p className="text-red-400 mb-3">Processing Error</p>

                  <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl text-red-300 overflow-x-auto">
                    {selectedEmail.processingError}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InboxPage;
