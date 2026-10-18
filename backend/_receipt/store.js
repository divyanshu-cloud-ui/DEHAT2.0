// Receipt number store. Holds only the counter and payment id -> receipt number. No personal data.
// Production: Upstash Redis over REST (Vercel Marketplace: UPSTASH_REDIS_REST_URL / _TOKEN, or the KV_REST_API_* aliases).
const { receiptNumber } = require('./format');

function memoryStore() {
  const data = new Map();
  const counters = new Map();
  return {
    kind: 'memory',
    async number(paymentId, fy) {
      const existing = data.get('receipt:' + paymentId);
      if (existing) return existing;
      const next = (counters.get(fy) || 0) + 1;
      counters.set(fy, next);
      const value = receiptNumber(fy, next);
      data.set('receipt:' + paymentId, value);
      return value;
    },
    async isSent(paymentId) { return data.has('sent:' + paymentId); },
    async markSent(paymentId) { data.set('sent:' + paymentId, '1'); },
    async lock(paymentId) { if (data.has('lock:' + paymentId)) return false; data.set('lock:' + paymentId, '1'); return true; },
    async unlock(paymentId) { data.delete('lock:' + paymentId); },
  };
}

function upstashStore({ url, token, fetchImpl = fetch }) {
  async function cmd(args) {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    });
    const parsed = await response.json().catch(() => ({}));
    if (!response.ok || parsed.error) throw new Error('Receipt store error');
    return parsed.result;
  }
  return {
    kind: 'upstash',
    async number(paymentId, fy) {
      const key = 'receipt:' + paymentId;
      const existing = await cmd(['GET', key]);
      if (existing) return existing;
      const sequence = await cmd(['INCR', 'receipt:seq:' + fy]);
      const value = receiptNumber(fy, sequence);
      const stored = await cmd(['SET', key, value, 'NX']);
      if (stored === 'OK') return value;
      return await cmd(['GET', key]);
    },
    async isSent(paymentId) { return (await cmd(['GET', 'receipt:sent:' + paymentId])) === '1'; },
    async markSent(paymentId) { await cmd(['SET', 'receipt:sent:' + paymentId, '1']); },
    async lock(paymentId) { return (await cmd(['SET', 'receipt:lock:' + paymentId, '1', 'NX', 'EX', '120'])) === 'OK'; },
    async unlock(paymentId) { await cmd(['DEL', 'receipt:lock:' + paymentId]); },
  };
}

function storeFromEnv(env = process.env) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return upstashStore({ url, token });
}

module.exports = { memoryStore, storeFromEnv, upstashStore };
