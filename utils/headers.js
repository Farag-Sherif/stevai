class CookieStore {
  get(name) {
    if (typeof document === "undefined") return undefined;
    const parts = document.cookie ? document.cookie.split("; ") : [];
    const found = parts.find((part) => part.startsWith(`${name}=`));
    if (!found) return undefined;
    return { name, value: decodeURIComponent(found.slice(name.length + 1)) };
  }

  set(name, value, options = {}) {
    if (typeof document === "undefined") return;
    const cookieParts = [`${name}=${encodeURIComponent(value)}`];
    cookieParts.push(`path=${options.path || "/"}`);
    if (typeof options.maxAge === "number") cookieParts.push(`max-age=${options.maxAge}`);
    if (options.sameSite) cookieParts.push(`samesite=${options.sameSite}`);
    if (options.secure) cookieParts.push("secure");
    document.cookie = cookieParts.join("; ");
  }

  delete(name) {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; path=/; max-age=0`;
  }
}

export async function cookies() {
  return new CookieStore();
}
