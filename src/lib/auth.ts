export interface GoogleUser {
  email: string;
  name: string;
  picture: string;
}

export function decodeCredential(credential: string): GoogleUser {
  const payload = credential.split(".")[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const jsonStr = decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join("")
  );
  const data = JSON.parse(jsonStr);
  return {
    email: data.email,
    name: data.name,
    picture: data.picture,
  };
}

const AUTH_KEY = "todolist-google-user";

export function saveUser(user: GoogleUser): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function loadUser(): GoogleUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GoogleUser;
  } catch {
    return null;
  }
}

export function clearUser(): void {
  localStorage.removeItem(AUTH_KEY);
}
