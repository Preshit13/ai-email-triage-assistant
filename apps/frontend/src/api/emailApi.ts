export async function fetchEmails() {
  const response = await fetch("http://localhost:4000/emails");

  if (!response.ok) {
    throw new Error("Failed fetching emails");
  }

  return response.json();
}

export async function processEmails() {
  const response = await fetch("http://localhost:4000/emails/process", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed processing emails");
  }

  return response.json();
}

export async function executeTools() {
  const response = await fetch("http://localhost:4000/tool-calls/execute", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Failed executing tools");
  }

  return response.json();
}

export async function uploadCsv(file: File) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch("http://localhost:4000/upload-csv", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  return response.json();
}
