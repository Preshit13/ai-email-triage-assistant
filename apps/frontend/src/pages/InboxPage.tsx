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
  const [actionLoading, setActionLoading] = useState(false);

  async function handleProcessEmails() {
    try {
      setActionLoading(true);

      await processEmails();

      const updatedEmails = await fetchEmails();

      setEmails(updatedEmails.data);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleExecuteTools() {
    try {
      setActionLoading(true);

      await executeTools();

      const updatedEmails = await fetchEmails();

      setEmails(updatedEmails.data);
    } catch (error) {
      console.error(error);
    } finally {
      setActionLoading(false);
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
              disabled={actionLoading}
              className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold transition"
            >
              {actionLoading ? "Processing..." : "Process Emails"}
            </button>

            <button
              onClick={handleExecuteTools}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 px-5 py-3 rounded-xl font-semibold transition"
            >
              {actionLoading ? "Executing..." : "Execute Tools"}
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

        {selectedEmail && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 overflow-y-auto z-50">
            <div className="bg-zinc-900 p-8 rounded-2xl max-w-3xl w-full border border-zinc-700 shadow-2xl max-h-[90vh] overflow-y-auto relative">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">Email Details</h2>

                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-zinc-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-zinc-400 text-sm mb-1">From</p>

                  <p className="text-lg">{selectedEmail.from}</p>
                </div>

                <div>
                  <p className="text-zinc-400 text-sm mb-1">Subject</p>

                  <p className="text-lg font-semibold">
                    {selectedEmail.subject}
                  </p>
                </div>

                <div>
                  <p className="text-zinc-400 text-sm mb-1">Status</p>

                  <p>{selectedEmail.processingStatus}</p>
                </div>

                <div>
                  <p className="text-zinc-400 text-sm mb-2">Email Body</p>

                  <div className="bg-zinc-800 p-5 rounded-xl max-h-80 overflow-y-auto text-sm leading-7 text-zinc-300">
                    {selectedEmail.body}
                  </div>
                </div>

                {selectedEmail.processingError && (
                  <div>
                    <p className="text-red-400 text-sm mb-2">
                      Processing Error
                    </p>

                    <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-sm text-red-300">
                      {selectedEmail.processingError}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InboxPage;
