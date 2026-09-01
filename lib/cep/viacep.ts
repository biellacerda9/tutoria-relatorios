export interface ViaCepResult {
  cepValido: boolean;
  cidade: string | null;
  uf: string | null;
  bairro: string | null;
  logradouro: string | null;
}

interface ViaCepApiResponse {
  erro?: boolean;
  localidade?: string;
  uf?: string;
  bairro?: string;
  logradouro?: string;
}

const INVALID_RESULT: ViaCepResult = {
  cepValido: false,
  cidade: null,
  uf: null,
  bairro: null,
  logradouro: null,
};

const cache = new Map<string, Promise<ViaCepResult>>();

export function normalizeCep(cep: string | null): string | null {
  if (!cep) return null;
  const digits = cep.replace(/\D/g, "");
  return digits.length === 8 ? digits : null;
}

async function fetchCep(cep: string): Promise<ViaCepResult> {
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!res.ok) return INVALID_RESULT;
    const data = (await res.json()) as ViaCepApiResponse;
    if (data.erro) return INVALID_RESULT;
    return {
      cepValido: true,
      cidade: data.localidade ?? null,
      uf: data.uf ?? null,
      bairro: data.bairro ?? null,
      logradouro: data.logradouro ?? null,
    };
  } catch {
    return INVALID_RESULT;
  }
}

export function lookupCep(rawCep: string | null): Promise<ViaCepResult> {
  const cep = normalizeCep(rawCep);
  if (!cep) return Promise.resolve(INVALID_RESULT);

  const cached = cache.get(cep);
  if (cached) return cached;

  const promise = fetchCep(cep);
  cache.set(cep, promise);
  return promise;
}

export async function lookupCepsWithConcurrency<T>(
  items: T[],
  getCep: (item: T) => string | null,
  concurrency: number,
  onProgress?: (done: number, total: number) => void
): Promise<Map<T, ViaCepResult>> {
  const results = new Map<T, ViaCepResult>();
  let index = 0;
  let done = 0;

  async function worker() {
    while (index < items.length) {
      const current = items[index++];
      const result = await lookupCep(getCep(current));
      results.set(current, result);
      done++;
      onProgress?.(done, items.length);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
