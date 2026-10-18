// Minimal Upstash Redis REST client for small records (UPI pending gifts). Same store as the receipt counter.
function kvClient({ url, token, fetchImpl = fetch }) {
  async function cmd(args) {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    const parsed = await response.json().catch(() => ({}));
    if (!response.ok || parsed.error) throw new Error('Store error');
    return parsed.result;
  }
  return { cmd };
}

function kvFromEnv(env = process.env) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return kvClient({ url, token });
}

// A small in-memory stand-in for tests.
function memoryKv() {
  const data = new Map();
  return {
    data,
    async cmd([op, key, value, ...rest]) {
      if (op === 'GET') return data.has(key) ? data.get(key) : null;
      if (op === 'SET') { if (rest.includes('NX') && data.has(key)) return null; data.set(key, value); return 'OK'; }
      if (op === 'INCR') { const n = Number(data.get(key) || 0) + 1; data.set(key, String(n)); return n; }
      if (op === 'EXPIRE') return 1;
      if (op === 'DEL') { data.delete(key); return 1; }
      throw new Error('unsupported ' + op);
    },
  };
}

module.exports = { kvClient, kvFromEnv, memoryKv };
