const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export interface ToolExecution {
  id: string;
  executionResultJson: Record<string, unknown>;
  executedAt: string;
}

export interface ToolCall {
  id: string;
  toolName: string;
  rationale: string;
  argumentsJson: Record<string, unknown>;
  execution?: ToolExecution | null;
}

export interface Email {
  id: string;
  from: string;
  to: string;
  cc?: string | null;
  subject: string;
  body: string;
  date: string;
  processingStatus: string;
  processingError?: string | null;
  toolCalls: ToolCall[];
}

export async function fetchEmails(): Promise<{
  success: boolean;
  count: number;
  data: Email[];
}> {
  const response = await fetch(`${API_BASE_URL}/emails`);

  if (!response.ok) {
    throw new Error("Failed fetching emails");
  }

  return response.json();
}

export async function processEmails() {
  const response = await fetch(`${API_BASE_URL}/emails/process`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed processing emails");
  }

  return response.json();
}

export async function retryEmail(emailId: string) {
  const response = await fetch(`${API_BASE_URL}/emails/${emailId}/retry`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed retrying email");
  }

  return response.json();
}

export async function executeTools() {
  const response = await fetch(`${API_BASE_URL}/tool-calls/execute`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed executing tools");
  }

  return response.json();
}

export async function executeSingleTool(toolCallId: string) {
  const response = await fetch(
    `${API_BASE_URL}/tool-calls/${toolCallId}/execute`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Failed executing tool");
  }

  return response.json();
}

export async function uploadCsv(
  file: File,
  onProgress?: (progress: number) => void,
) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();

    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.open("POST", `${API_BASE_URL}/upload-csv`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);

        onProgress(progress);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        let errorMessage = "Upload failed";

        let missingColumns: string[] = [];

        try {
          const errorData = JSON.parse(xhr.responseText);

          errorMessage = errorData.message || errorMessage;

          missingColumns = errorData.missingColumns || [];
        } catch {
          console.error("Failed parsing upload error");
        }

        reject({
          message: errorMessage,
          missingColumns,
        });
      }
    };

    xhr.onerror = () => {
      reject({
        message: "Network error during upload",
        missingColumns: [],
      });
    };

    xhr.send(formData);
  });
}
