import { useEffect, useState } from "react";

import {
  fetchEmails,
  processEmails,
  executeTools,
  executeSingleTool,
  retryEmail,
} from "../api/emailApi";

import type { Email } from "../api/emailApi";

function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);

  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const [loading, setLoading] = useState(true);

  const [processingEmails, setProcessingEmails] = useState(false);

  const [executingTools, setExecutingTools] = useState(false);

  const [executingToolId, setExecutingToolId] = useState<string | null>(null);

  const [retryingEmailId, setRetryingEmailId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedToolFilter, setSelectedToolFilter] = useState("ALL");

  async function refreshEmails() {
    const updatedEmails = await fetchEmails();

    setEmails(updatedEmails.data);

    if (selectedEmail) {
      const refreshedSelectedEmail = updatedEmails.data.find(
        (email) => email.id === selectedEmail.id,
      );

      setSelectedEmail(refreshedSelectedEmail || null);
    }
  }

  async function handleProcessEmails() {
    try {
      setProcessingEmails(true);

      await processEmails();

      await refreshEmails();
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

      await refreshEmails();
    } catch (error) {
      console.error(error);
    } finally {
      setExecutingTools(false);
    }
  }

  async function handleExecuteSingleTool(toolCallId: string) {
    try {
      setExecutingToolId(toolCallId);

      await executeSingleTool(toolCallId);

      await refreshEmails();
    } catch (error) {
      console.error(error);
    } finally {
      setExecutingToolId(null);
    }
  }

  async function handleRetryEmail(emailId: string) {
    try {
      setRetryingEmailId(emailId);

      await retryEmail(emailId);

      await refreshEmails();
    } catch (error) {
      console.error(error);
    } finally {
      setRetryingEmailId(null);
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

  const availableTools = Array.from(
    new Set(
      emails.flatMap((email) =>
        email.toolCalls.map((toolCall) => toolCall.toolName),
      ),
    ),
  );

  const filteredEmails = emails.filter((email) => {
    const matchesSearch =
      email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTool =
      selectedToolFilter === "ALL" ||
      email.toolCalls.some(
        (toolCall) => toolCall.toolName === selectedToolFilter,
      );

    return matchesSearch && matchesTool;
  });

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

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Search sender or subject..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
          />

          <select
            value={selectedToolFilter}
            onChange={(event) => setSelectedToolFilter(event.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
          >
            <option value="ALL">All Tools</option>

            {availableTools.map((toolName) => (
              <option key={toolName} value={toolName}>
                {toolName}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
          <table className="w-full">
            <thead className="bg-zinc-800 text-zinc-300">
              <tr>
                <th className="text-left px-6 py-4">From</th>

                <th className="text-left px-6 py-4">Subject</th>

                <th className="text-left px-6 py-4">Date</th>

                <th className="text-left px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmails.map((email) => (
                <tr
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className="border-t border-zinc-800 hover:bg-zinc-800/40 transition cursor-pointer"
                >
                  <td className="px-6 py-4 text-zinc-300">{email.from}</td>

                  <td className="px-6 py-4">
                    <p>{email.subject}</p>

                    {email.toolCalls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {email.toolCalls.map((toolCall) => (
                          <span
                            key={toolCall.id}
                            className="bg-zinc-800 border border-zinc-700 px-2 py-1 rounded-full text-xs text-zinc-300"
                          >
                            {toolCall.toolName}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 text-zinc-300">
                    {new Date(email.date).toLocaleDateString("en-US", {
                      timeZone: "UTC",
                    })}
                  </td>

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

            <h2 className="text-2xl font-bold mb-8">Email Details</h2>

            <div className="space-y-6">
              <div>
                <p className="text-zinc-400 mb-2">From</p>

                <p className="font-semibold">{selectedEmail.from}</p>
              </div>

              <div>
                <p className="text-zinc-400 mb-2">Subject</p>

                <p className="font-semibold">{selectedEmail.subject}</p>
              </div>

              <div>
                <p className="text-zinc-400 mb-2">Status</p>

                <div className="flex items-center gap-4">
                  <p>{selectedEmail.processingStatus}</p>

                  {selectedEmail.processingStatus === "FAILED" && (
                    <button
                      onClick={() => handleRetryEmail(selectedEmail.id)}
                      disabled={retryingEmailId === selectedEmail.id}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed px-3 py-1 rounded-lg text-sm font-semibold transition"
                    >
                      {retryingEmailId === selectedEmail.id
                        ? "Retrying..."
                        : "Retry Processing"}
                    </button>
                  )}
                </div>
              </div>

              <div>
                <p className="text-zinc-400 mb-4">Email Body</p>

                <div className="bg-zinc-800 p-6 rounded-2xl leading-7 text-zinc-300 whitespace-pre-wrap">
                  {selectedEmail.body}
                </div>
              </div>

              {selectedEmail.toolCalls.length > 0 && (
                <div>
                  <p className="text-zinc-400 mb-4 font-semibold">
                    AI Suggested Actions
                  </p>

                  <div className="space-y-4">
                    {selectedEmail.toolCalls.map((toolCall) => (
                      <div
                        key={toolCall.id}
                        className="bg-zinc-800 border border-zinc-700 rounded-2xl p-5"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            {toolCall.toolName}
                          </span>

                          {toolCall.execution ? (
                            <span className="text-green-400 text-sm font-semibold">
                              Executed
                            </span>
                          ) : (
                            <button
                              onClick={(event) => {
                                event.stopPropagation();

                                handleExecuteSingleTool(toolCall.id);
                              }}
                              disabled={executingToolId === toolCall.id}
                              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900 disabled:cursor-not-allowed px-3 py-1 rounded-lg text-sm font-semibold transition"
                            >
                              {executingToolId === toolCall.id
                                ? "Executing..."
                                : "Execute Tool"}
                            </button>
                          )}
                        </div>

                        <div className="mb-5">
                          <p className="text-zinc-400 mb-2">Rationale</p>

                          <p className="text-zinc-200 leading-7">
                            {toolCall.rationale}
                          </p>
                        </div>

                        <div className="mb-5">
                          <p className="text-zinc-400 mb-2">Arguments</p>

                          <pre className="bg-zinc-950 p-4 rounded-xl text-sm overflow-x-auto text-zinc-300">
                            {JSON.stringify(toolCall.argumentsJson, null, 2)}
                          </pre>
                        </div>

                        {toolCall.execution && (
                          <div>
                            <p className="text-zinc-400 mb-2">
                              Execution Result
                            </p>

                            <pre className="bg-zinc-950 p-4 rounded-xl text-sm overflow-x-auto text-zinc-300">
                              {JSON.stringify(
                                toolCall.execution.executionResultJson,
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
