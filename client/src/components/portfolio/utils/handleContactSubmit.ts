import { FormEvent } from "react";

export const handleContactSubmit = async (e: FormEvent) => {
  e.preventDefault();
  const formData = new FormData(e.target as HTMLFormElement);
  formData.append("access_key", "9c62c997-6178-47f0-a556-9c341920e3e2"); // public access key

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    } else return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
